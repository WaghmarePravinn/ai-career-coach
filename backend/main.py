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
        logger.info("Successfully connected to Supabase persistent store.")
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")

app = FastAPI(title="CareerPath AI - Enterprise v9", version="9.0.0")

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
    return {
        "status": "healthy", 
        "version": "9.0.0", 
        "persistence": "active" if supabase else "disabled"
    }

@app.get("/api/history/{user_id}")
async def get_history(user_id: str):
    """Retrieves sorted unique conversations for a given user."""
    if not supabase:
        logger.warning("Attempted to fetch history but Supabase is disabled.")
        return []
    
    try:
        # Fetching latest entries for unique conversation IDs
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
        logger.error(f"History retrieval fault for {user_id}: {str(e)}")
        return []

@app.get("/api/messages/{conversation_id}")
async def get_messages(conversation_id: str):
    """Retrieves all messages for a specific conversation session."""
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
        logger.error(f"Message block retrieval failure for {conversation_id}: {str(e)}")
        return []

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Processes RAG-enhanced chat and persists data to Supabase."""
    try:
        # 1. RAG-Enabled Inference
        history_list = [h.model_dump() for h in request.history]
        response_text = rag_service.query_resume(request.message, history_list)
        
        # 2. Supabase Data Persistence (Async-like flow)
        if supabase and request.user_id:
            conv_id = request.conversation_id or str(uuid.uuid4())
            timestamp = datetime.now().isoformat()
            
            # Generate a title if it's a new conversation
            conv_title = request.message[:40] + ("..." if len(request.message) > 40 else "")
            
            # Persist User Input
            supabase.table('chat_history').insert({
                "user_id": request.user_id,
                "conversation_id": conv_id,
                "message": request.message,
                "sender": "user",
                "title": conv_title,
                "created_at": timestamp
            }).execute()
            
            # Persist Model Output
            supabase.table('chat_history').insert({
                "user_id": request.user_id,
                "conversation_id": conv_id,
                "message": response_text,
                "sender": "model",
                "title": conv_title,
                "created_at": datetime.now().isoformat()
            }).execute()
            
            logger.info(f"Persisted chat cycle for User {request.user_id} in Conv {conv_id}")
            
        return {"response": response_text}
    except Exception as e:
        logger.error(f"Chat Inference/Persistence Error: {str(e)}")
        raise HTTPException(status_code=500, detail="The AI engine encountered a synchronization fault.")

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    """PDF Ingestion to Pinecone Vector Store."""
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
        logger.error(f"Resume ingestion failure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

@app.post("/api/roadmap")
async def roadmap(request: Dict[str, Any]):
    """Generates structured career trajectory roadmap."""
    try:
        target_role = request.get('target_role', 'Senior Computer Engineer')
        roadmap_data = rag_service.get_career_roadmap(target_role)
        return roadmap_data
    except Exception as e:
        logger.error(f"Roadmap generation pipeline crash: {str(e)}")
        raise HTTPException(status_code=500, detail="Roadmap pipeline failed.")

if __name__ == "__main__":
    import uvicorn
    # In production, use environment PORT or default to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
