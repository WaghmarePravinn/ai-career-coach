import os
import logging
import json
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

# Vector DB & AI Imports
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()
logger = logging.getLogger("CareerPath-RAG")

# Constants
CHUNK_SIZE = 1000
CHUNK_OVERLAP = 200
TOP_K = 5
EMBEDDING_MODEL = "models/text-embedding-004"
LLM_MODEL = "gemini-3-flash-preview"

def get_vectorstore():
    embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
    index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
    return PineconeVectorStore(index_name=index_name, embedding=embeddings)

def process_resume(file_path: str, user_id: str) -> int:
    """Ingest PDF and store chunks in Pinecone with USER_ID metadata for isolation."""
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        # Optimized chunking
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, 
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ".", " "]
        )
        chunks = text_splitter.split_documents(documents)
        
        # SECURITY: Inject user_id into every chunk's metadata
        for chunk in chunks:
            chunk.metadata["user_id"] = user_id
        
        embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        
        # Upserting protected chunks
        PineconeVectorStore.from_documents(chunks, embeddings, index_name=index_name)
        logger.info(f"RAG: Indexed {len(chunks)} chunks for user {user_id}")
        return len(chunks)
    except Exception as e:
        logger.error(f"RAG Process Fail: {str(e)}")
        raise e

def query_resume(question: str, history: List[Dict] = None, user_id: Optional[str] = None) -> str:
    """Query vector store with strict USER_ID metadata filtering."""
    try:
        vectorstore = get_vectorstore()
        llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.7)
        
        # Build history context
        hist_str = ""
        if history:
            hist_str = "\n".join([f"{h['role'].upper()}: {h['content']}" for h in history[-4:]])

        template = """
        System: You are an elite Career Architect.
        Conversation History:
        {history}
        
        Context from candidate resume:
        {context}
        
        Candidate Question: {question}
        
        Architect Response:"""

        # SECURITY: Apply filter so search ONLY looks at this specific user's chunks
        search_kwargs = {"k": TOP_K}
        if user_id:
            search_kwargs["filter"] = {"user_id": user_id}

        qa_chain = RetrievalQA.from_chain_type(
            llm,
            retriever=vectorstore.as_retriever(search_kwargs=search_kwargs),
            chain_type_kwargs={"prompt": PromptTemplate.from_template(template.format(history=hist_str, context="{context}", question="{question}"))}
        )
        
        result = qa_chain.invoke({"query": question})
        return result["result"]
    except Exception as e:
        logger.error(f"Query Service Error: {str(e)}")
        raise e

def get_career_roadmap(target_role: str, user_id: Optional[str] = None) -> Dict[str, Any]:
    """Generate roadmap with metadata isolation."""
    try:
        vectorstore = get_vectorstore()
        llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.2)
        
        prompt_template = """
        Context: {context}
        Objective: Create a 4-Phase Roadmap for a {target_role} position.
        
        Return ONLY valid JSON:
        {{
            "missing_skills": [],
            "steps": [
                {{"title": "", "description": "", "difficulty": "", "estimated_time": ""}}
            ]
        }}
        """

        search_kwargs = {"k": 6}
        if user_id:
            search_kwargs["filter"] = {"user_id": user_id}

        qa_chain = RetrievalQA.from_chain_type(
            llm,
            retriever=vectorstore.as_retriever(search_kwargs=search_kwargs),
            chain_type_kwargs={"prompt": PromptTemplate.from_template(prompt_template.format(context="{context}", target_role=target_role))}
        )
        
        raw_result = qa_chain.invoke({"query": f"Map path to {target_role}"})
        clean_json = raw_result["result"].strip().replace("```json", "").replace("```", "")
        return json.loads(clean_json)
    except Exception as e:
        logger.error(f"Roadmap Pipeline Error: {str(e)}")
        raise e
