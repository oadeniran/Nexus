from database import db
import asyncio
from llm_client import VertexAIClient
from dtos import SaveSessionRequest, SearchRequest
import PROMPTS
import datetime
import math

llm_client = VertexAIClient()

async def save_session(req: SaveSessionRequest):
    # 1. Construct Transcript
    full_transcript = ""
    for turn in req.dialogue:
        full_transcript += f"{turn.role.upper()}: {turn.content}\n"

    # 2. Define Prompts
    # A. Markdown Prompt (The Content)
    md_system = PROMPTS.SYS_PROMPT
    
    # B. Title Prompt (Short string)
    title_system = "You are a database indexer. Read the transcript and output a single, catchy Title (max 6 words). Do not use quotes."
    
    # C. Description Prompt (Short summary)
    desc_system = "You are a archivist. Read the transcript and output a brief 2-sentence summary (max 30 words) for a dashboard card."

    messages_md = [{"role": "system", "content": md_system}, {"role": "user", "content": full_transcript}]
    messages_title = [{"role": "system", "content": title_system}, {"role": "user", "content": full_transcript}]
    messages_desc = [{"role": "system", "content": desc_system}, {"role": "user", "content": full_transcript}]

    # 3. RUN EVERYTHING IN PARALLEL
    loop = asyncio.get_running_loop()
    
    # We create 4 tasks
    # Note: We embed the transcript to ensure we capture the full context for search
    future_md = loop.run_in_executor(None, lambda: llm_client.chat_completion(messages_md))
    future_title = loop.run_in_executor(None, lambda: llm_client.chat_completion(messages_title))
    future_desc = loop.run_in_executor(None, lambda: llm_client.chat_completion(messages_desc))
    future_embed = loop.run_in_executor(None, lambda: llm_client.embed_text(full_transcript))

    # Wait for all 4 to finish (takes as long as the slowest one)
    md_content, title, description, embedding = await asyncio.gather(
        future_md, 
        future_title, 
        future_desc, 
        future_embed
    )
    
    # Check for "NO CONTENT AVAILABLE" in the markdown content
    if md_content.strip() == "NO CONTENT AVAILABLE":
        md_content = "No coherent content was detected in this session."
        return {"status": "no_content", "markdown": md_content}

    # 4. Save to DB
    doc = {
        "user_id": req.user_id,
        "type": req.session_type,
        "title": title.strip().strip('"'), # Clean up any accidental quotes
        "short_description": description.strip(),
        "raw_transcript": full_transcript,
        "formatted_markdown": md_content,
        "embedding": embedding,
        "created_at": datetime.datetime.now()
    }
    await db.sessions.insert_one(doc)

    return {"status": "saved", "markdown": md_content}

async def search_memory(req: SearchRequest):
    # 1. Convert User Query to Vector
    loop = asyncio.get_running_loop()
    query_vec = await loop.run_in_executor(
        None,
        lambda: llm_client.embed_text(req.query)
    )

    if not query_vec:
        return {"matches": []}

    # 2. Fetch all docs for this user
    cursor = db.sessions.find({"user_id": req.user_id})
    docs = await cursor.to_list(length=100)
    
    scored_docs = []
    
    # Calculate Magnitude of Query Vector (for Cosine math)
    mag_q = math.sqrt(sum(q * q for q in query_vec))

    print(f"\n--- Searching for: '{req.query}' ---")

    for doc in docs:
        if "embedding" not in doc or not doc["embedding"]: 
            continue
            
        doc_vec = doc["embedding"]
        
        # 3. Manual Cosine Similarity: (A . B) / (||A|| * ||B||)
        dot_product = sum(a * b for a, b in zip(query_vec, doc_vec))
        mag_d = math.sqrt(sum(d * d for d in doc_vec))
        
        if mag_q * mag_d == 0:
            score = 0
        else:
            score = dot_product / (mag_q * mag_d)
        
        # DEBUG: Print the score to your terminal
        print(f"Found Doc ({doc['type']}): Score = {score:.4f}")

        scored_docs.append((score, doc))

    # 4. Sort and Filter
    scored_docs.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, doc in scored_docs[:req.limit]:
        if score > 0.45: 
            results.append({
                "score": score,
                "markdown": doc["formatted_markdown"],
                "type": doc["type"],
                "created_at": doc["created_at"]
            })

    print(f"Returning {len(results)} matches.\n")
    return {"matches": results}

async def get_history(user_id: str = "user_123"):
    # Fetch all documents, sorted by newest first
    cursor = db.sessions.find({"user_id": user_id}).sort("created_at", -1)
    docs = await cursor.to_list(length=100)
    
    # Clean up for frontend (Convert ObjectId to string)
    results = []
    for doc in docs:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        # Ensure we send the fields you added (title, description)
        results.append(doc)
        
    return {"history": results}