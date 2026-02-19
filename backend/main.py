import os
import shutil
import uuid
import logging
from typing import List, Optional, Dict, Any
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
SUPABASE_KEY = os.environ.get("SUPABASE_KEY", "") 

supabase: Client = None
if SUPABASE_KEY:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        logger.info("Successfully connected to Supabase persistent store via Service Role.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")

app = FastAPI(title="CareerPath AI - Enterprise v11-Debug", version="11.0.1")

# Hardened CORS for development
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

# --- Endpoints ---

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "11.0.1", 
        "persistence": "active" if supabase else "disabled"
    }

@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    if not supabase:
        return []
    try:
        response = supabase.table('chat_history') \
            .select('conversation_id, title, created_at') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .execute()
        
        unique_sessions = []
        seen_ids = set()
        for row in response.data:
            c_id = row.get('conversation_id')
            if c_id and c_id not in seen_ids:
                unique_sessions.append({
                    "id": c_id,
                    "title": row.get('title') or "Career Consultation",
                    "last_updated": row.get('created_at')
                })
                seen_ids.add(c_id)
        return unique_sessions
    except Exception as e:
        logger.error(f"History retrieval fault: {str(e)}")
        return []

@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str):
    if not supabase: return []
    try:
        response = supabase.table('chat_history') \
            .select('sender, message, created_at') \
            .eq('conversation_id', conversation_id) \
            .order('created_at', desc=False) \
            .execute()
        return response.data
    except Exception as e:
        logger.error(f"Message retrieval failure: {str(e)}")
        return []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Hardened Chat Endpoint with specific AI Error Handling."""
    logger.info(f"CHAT_DEBUG: Processing request for User: {request.user_id}")
    
    if not request.message or not request.message.strip():
        raise HTTPException(status_code=400, detail="Empty transmission payload.")

    try:
        # 1. RAG-Enabled Inference with AI Error Handling
        history_list = [h.model_dump() for h in request.history]
        
        try:
            response_text = rag_service.query_resume(request.message, history_list)
            if not response_text:
                raise ValueError("Inference engine returned an empty response string.")
        except Exception as ai_err:
            logger.error(f"AI_ENGINE_ERROR: {str(ai_err)}")
            # Catch specific Vector Store issues
            if "Pinecone" in str(ai_err) or "vector" in str(ai_err).lower():
                raise HTTPException(
                    status_code=503, 
                    detail="Vector memory (Pinecone) is currently unreachable. Resume context is unavailable."
                )
            raise HTTPException(
                status_code=500, 
                detail=f"AI Generation Fault: {str(ai_err)}"
            )
        
        # 2. Supabase Data Persistence
        conv_id = request.conversation_id or str(uuid.uuid4())
        if supabase and request.user_id:
            try:
                timestamp = datetime.now().isoformat()
                conv_title = request.message[:40] + ("..." if len(request.message) > 40 else "")
                
                # Persistence Handshake
                supabase.table('chat_history').insert({
                    "user_id": request.user_id,
                    "conversation_id": conv_id,
                    "message": request.message,
                    "sender": "user",
                    "title": conv_title,
                    "created_at": timestamp
                }).execute()
                
                supabase.table('chat_history').insert({
                    "user_id": request.user_id,
                    "conversation_id": conv_id,
                    "message": response_text,
                    "sender": "model",
                    "title": conv_title,
                    "created_at": datetime.now().isoformat()
                }).execute()
                logger.info(f"PERSISTENCE_SUCCESS: Session {conv_id} updated.")
            except Exception as p_err:
                logger.error(f"PERSISTENCE_FAULT: {str(p_err)}")
                # We return the response even if persistence fails to keep the UX smooth
            
        return {"response": response_text, "conversation_id": conv_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"UNEXPECTED_CORE_FAULT: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal system handshake failure.")

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF architectural docs permitted.")
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

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)