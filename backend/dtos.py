from pydantic import BaseModel
from typing import List

class DialogueTurn(BaseModel):
    role: str
    content: str

class SaveSessionRequest(BaseModel):
    session_type: str  # 'scribe', 'debate', 'coach'
    dialogue: List[DialogueTurn]
    user_id: str

class SearchRequest(BaseModel):
    query: str
    user_id: str
    limit: int = 3