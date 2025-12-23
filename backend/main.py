# backend/main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, HTTPException
from dtos import SaveSessionRequest, SearchRequest
import app_logic



app = FastAPI()

# Allow the Frontend (running on localhost:3000) to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Nexus Brain Online", "message": "Ready to process ideas."}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/save-session")
async def save_session(req: SaveSessionRequest):
    try:
        result = await app_logic.save_session(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search")
async def search_memory(req: SearchRequest):
    try:
        result = await app_logic.search_memory(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/history")
async def get_history(user_id: str):
    try:
        result = await app_logic.get_history(user_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)