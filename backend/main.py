import os
import shutil
import uuid
import logging
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from supabase import create_client, Client

# RAG Engine
import rag_service

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("CareerPath-Core")

# Supabase Initialization
SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://hsxywwvjmqtdrwxlfhqx.supabase.co")
# service_role key for backend operations
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "") 

supabase: Client = None
if SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    logger.warning("SUPABASE_KEY not found. Persistence will be disabled.")

app = FastAPI(title="CareerPath AI - Enterprise v8", version="8.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Schema Definitions ---

class HistoryItem(BaseModel):
    role: str = Field(..., pattern="^(user|model)$")
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[HistoryItem] = []
    user_id: Optional[str] = None
    conversation_id: Optional[str] = None

class AuthRequest(BaseModel):
    email: str
    password: str

# --- Endpoints ---

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": "8.0.0", "db": "supabase-active" if supabase else "local-only"}

@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    if not supabase:
        return []
    
    try:
        # Get unique conversations for the user
        response = supabase.table('chat_history') \
            .select('conversation_id, title, created_at') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .execute()
        
        # Group by conversation_id (Supabase doesn't support distinct on select yet in simple way)
        unique_convs = []
        seen_ids = set()
        for row in response.data:
            c_id = row.get('conversation_id') or 'default'
            if c_id not in seen_ids:
                unique_convs.append({
                    "id": c_id,
                    "title": row.get('title') or "Conversation",
                    "created_at": row.get('created_at')
                })
                seen_ids.add(c_id)
        
        return unique_convs
    except Exception as e:
        logger.error(f"History Fetch Error: {str(e)}")
        return []

@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str):
    if not supabase:
        return []
    
    try:
        response = supabase.table('chat_history') \
            .select('sender, message, created_at') \
            .eq('conversation_id', conversation_id) \
            .order('created_at', desc=False) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Messages Fetch Error: {str(e)}")
        return []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # 1. RAG Processing
        history_list = [h.model_dump() for h in request.history]
        response_text = rag_service.query_resume(request.message, history_list)
        
        # 2. Supabase Persistence
        if supabase and request.user_id:
            conv_id = request.conversation_id or str(uuid.uuid4())
            # Save User Message
            supabase.table('chat_history').insert({
                "user_id": request.user_id,
                "conversation_id": conv_id,
                "message": request.message,
                "sender": "user",
                "title": request.message[:30] + "..." if len(request.message) > 30 else request.message
            }).execute()
            
            # Save Model Response
            supabase.table('chat_history').insert({
                "user_id": request.user_id,
                "conversation_id": conv_id,
                "message": response_text,
                "sender": "model"
            }).execute()
            
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Inference Failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Engine fault.")

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files allowed.")

    temp_id = str(uuid.uuid4())
    temp_path = f"/tmp/{temp_id}_{file.filename}"
    
    try:
        if not os.path.exists("/tmp"): os.makedirs("/tmp")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        chunk_count = rag_service.process_resume(temp_path)
        return {"status": "success", "chunks_processed": chunk_count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

@app.post("/api/roadmap")
async def roadmap(request: BaseModel):
    try:
        data = request.model_dump()
        roadmap_data = rag_service.get_career_roadmap(data.get('target_role', 'Architect'))
        return roadmap_data
    except Exception as e:
        raise HTTPException(status_code=500, detail="Roadmap pipeline error.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
