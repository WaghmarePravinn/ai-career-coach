
import os
import shutil
import uuid
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .rag_service import process_resume

app = FastAPI(
    title="CareerPath AI - Backend",
    description="Microservice for RAG and Multi-Agent Resume Analysis",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "backend-core", "pipeline": "rag-enabled"}

@app.post("/api/upload_resume")
async def upload_resume(file: UploadFile = File(...)):
    """
    Endpoint to receive resume PDF and trigger the RAG ingestion pipeline.
    """
    # 1. Validation: Only allow PDF
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    # 2. File Lifecycle Management: Secure temporary storage
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join("/tmp" if os.name != 'nt' else ".", temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # 3. Trigger RAG Pipeline
        chunk_count = process_resume(temp_path)
        
        return {
            "status": "success",
            "message": "Resume successfully indexed for RAG",
            "chunks_processed": chunk_count,
            "filename": file.filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Ingestion Error: {str(e)}")
    
    finally:
        # 4. Cleanup: Ensure temp files are deleted regardless of success/fail
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
