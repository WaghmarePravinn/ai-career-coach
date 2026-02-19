import os
import shutil
import uuid
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client

import rag_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("CareerPath-Core")

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hsxywwvjmqtdrwxlfhqx.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "") 

supabase: Client = None
if SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    except Exception as e:
        logger.error(f"Supabase Init Error: {str(e)}")

app = FastAPI(title="CareerPath AI - Audit Ready v11", version="11.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class HistoryItem(BaseModel):
    role: str = Field(..., pattern="^(user|model)$")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[HistoryItem] = []
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

@app.post("/api/chat")
async def chat(request: ChatRequest):
    logger.info(f"AUDIT: Request from user {request.user_id}")
    try:
        history_list = [h.model_dump() for h in request.history]
        
        # PASSING USER_ID FOR RAG ISOLATION
        response_text = rag_service.query_resume(
            request.message, 
            history_list, 
            user_id=request.user_id
        )
        
        conv_id = request.conversation_id or str(uuid.uuid4())
        if supabase and request.user_id:
            try:
                conv_title = request.message[:40] + "..."
                supabase.table('chat_history').insert([
                    {"user_id": request.user_id, "conversation_id": conv_id, "message": request.message, "sender": "user", "title": conv_title},
                    {"user_id": request.user_id, "conversation_id": conv_id, "message": response_text, "sender": "model", "title": conv_title}
                ]).execute()
            except Exception as e:
                logger.error(f"Persistence fail: {e}")
            
        return {"response": response_text, "conversation_id": conv_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...), user_id: Optional[str] = Header(None)):
    if not user_id:
        raise HTTPException(status_code=401, detail="User Identity Required for Vector Isolation.")
    
    temp_path = f"/tmp/{uuid.uuid4()}_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # PASSING USER_ID TO TAG VECTOR CHUNKS
        chunk_count = rag_service.process_resume(temp_path, user_id=user_id)
        return {"status": "success", "chunks_processed": chunk_count}
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

@app.post("/api/roadmap")
async def roadmap(request: Dict[str, Any]):
    user_id = request.get("user_id")
    target_role = request.get("target_role", "Staff Engineer")
    return rag_service.get_career_roadmap(target_role, user_id=user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
