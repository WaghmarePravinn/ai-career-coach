import os
import logging
from typing import List, Any
from dotenv import load_dotenv

# Fix: Initialize environment variables from .env immediately
load_dotenv()

from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from pinecone import Pinecone

# Setup logging for production observability
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_resume(file_path: str) -> int:
    """
    Orchestrates the RAG ingestion pipeline:
    1. Loads PDF content.
    2. Splits into semantic chunks.
    3. Generates Gemini-powered embeddings.
    4. Upserts to Pinecone Vector DB.
    """
    try:
        logger.info(f"Processing PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        # Semantic Splitting
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Generated {len(chunks)} chunks.")

        # Fix: Using models/text-embedding-004 for 768-dimension index compatibility
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        
        # Ingest to Pinecone
        PineconeVectorStore.from_documents(
            chunks, 
            embeddings, 
            index_name=index_name
        )

        logger.info("Successfully ingested vectors to Pinecone.")
        return len(chunks)

    except Exception as e:
        logger.error(f"RAG Pipeline Failure: {str(e)}")
        raise e
