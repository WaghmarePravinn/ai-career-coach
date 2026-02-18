
import os
import logging
from typing import Int
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
        # 1. DOCUMENT LOADING: Parse the physical file
        logger.info(f"Processing PDF: {file_path}")
        loader = PyPDFLoader(file_path)
        documents = loader.load()

        # 2. SEMANTIC SPLITTING: Break text into manageable pieces for LLM context windows
        # chunk_overlap ensures we don't lose context between slices
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, 
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        chunks = text_splitter.split_documents(documents)
        logger.info(f"Generated {len(chunks)} chunks from resume.")

        # 3. EMBEDDING GENERATION: Convert text to high-dimensional vectors
        # Using Google's embedding-001 model for cost-efficient, high-performance RAG
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=os.getenv("GOOGLE_API_KEY")
        )

        # 4. VECTOR STORAGE: Store chunks in Pinecone for retrieval
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        
        # Initialize Pinecone Client
        pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
        
        # Ingest to Pinecone using LangChain wrapper
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
