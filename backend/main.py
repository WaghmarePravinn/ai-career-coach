import os
import shutil
import uuid
from typing import List, Dict
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import logging

# Absolute imports
from rag_service import process_resume, query_resume, get_career_roadmap

app = FastAPI(
    title="CareerPath AI - Backend",
    description="Microservice for RAG and Multi-Agent Resume Analysis",
    version="3.0.0"
)

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Strict CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

class RoadmapRequest(BaseModel):
    target_role: str

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "backend-core", "pipeline": "rag-enabled"}

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_dir = "/tmp" if os.name != 'nt' else "."
    if not os.path.exists(temp_dir): os.makedirs(temp_dir)
    temp_path = os.path.join(temp_dir, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        chunk_count = process_resume(temp_path)
        return {"status": "success", "chunks_processed": chunk_count}
    except Exception as e:
        logger.error(f"Upload Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path): os.remove(temp_path)

@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        # Pass history to the RAG service for conversational context
        response = query_resume(request.message, request.history)
        return {"response": response}
    except Exception as e:
        logger.error(f"Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/roadmap")
async def roadmap(request: RoadmapRequest):
    try:
        logger.info(f"Generating roadmap for: {request.target_role}")
        roadmap_data = get_career_roadmap(request.target_role)
        return roadmap_data
    except Exception as e:
        logger.error(f"Roadmap Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
