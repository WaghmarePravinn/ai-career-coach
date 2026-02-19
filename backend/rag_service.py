import os
import logging
import json
from typing import List, Dict, Any
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

def process_resume(file_path: str) -> int:
    """Ingest PDF and store chunks in Pinecone."""
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        
        # Optimized chunking for career context retention
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE, 
            chunk_overlap=CHUNK_OVERLAP,
            separators=["\n\n", "\n", ".", " "]
        )
        chunks = text_splitter.split_documents(documents)
        
        embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL)
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        
        # Upserting chunks
        PineconeVectorStore.from_documents(chunks, embeddings, index_name=index_name)
        return len(chunks)
    except Exception as e:
        logger.error(f"RAG Process Fail: {str(e)}")
        raise e

def query_resume(question: str, history: List[Dict] = None) -> str:
    """Query the vector store with conversation memory."""
    try:
        vectorstore = get_vectorstore()
        llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.7)
        
        # Build history context
        hist_str = ""
        if history:
            hist_str = "\n".join([f"{h['role'].upper()}: {h['content']}" for h in history[-4:]]) # Last 4 turns

        template = f"""
        System: You are an elite Career Architect.
        Conversation History:
        {hist_str}
        
        Context from candidate resume:
        {{context}}
        
        Candidate Question: {{question}}
        
        Response Guidelines:
        1. Be specific based on the provided resume context.
        2. If info is missing, suggest how to obtain it.
        3. Professional, concise, and architectural tone.
        
        Architect Response:"""

        qa_chain = RetrievalQA.from_chain_type(
            llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": TOP_K}),
            chain_type_kwargs={"prompt": PromptTemplate.from_template(template)}
        )
        
        result = qa_chain.invoke({"query": question})
        return result["result"]
    except Exception as e:
        logger.error(f"Query Service Error: {str(e)}")
        raise e

def get_career_roadmap(target_role: str) -> Dict[str, Any]:
    """Identify skill gaps and generate a transition timeline."""
    try:
        vectorstore = get_vectorstore()
        llm = ChatGoogleGenerativeAI(model=LLM_MODEL, temperature=0.2)
        
        prompt_template = """
        Context: {context}
        Objective: Create a Skill Gap Analysis and 4-Phase Roadmap for a {target_role} position.
        
        CRITICAL: Return ONLY valid JSON.
        Format:
        {{
            "missing_skills": ["List", "of", "skills"],
            "steps": [
                {{
                    "title": "Phase Title",
                    "description": "Specific actions",
                    "difficulty": "Beginner|Intermediate|Advanced",
                    "estimated_time": "Time frame"
                }}
            ]
        }}
        """

        qa_chain = RetrievalQA.from_chain_type(
            llm,
            retriever=vectorstore.as_retriever(search_kwargs={"k": 6}),
            chain_type_kwargs={"prompt": PromptTemplate.from_template(prompt_template)}
        )
        
        raw_result = qa_chain.invoke({"query": f"Map a path to {target_role}"})
        # Basic cleaning for LLM markdown output
        clean_json = raw_result["result"].strip().replace("```json", "").replace("```", "")
        return json.loads(clean_json)
    except Exception as e:
        logger.error(f"Roadmap Pipeline Error: {str(e)}")
        raise e
