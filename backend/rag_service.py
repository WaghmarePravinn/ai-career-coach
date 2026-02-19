import os
import logging
import json
from typing import List, Any, Dict
from dotenv import load_dotenv

load_dotenv()

from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_pinecone import PineconeVectorStore
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from pinecone import Pinecone

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def process_resume(file_path: str) -> int:
    try:
        loader = PyPDFLoader(file_path)
        documents = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        chunks = text_splitter.split_documents(documents)
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        PineconeVectorStore.from_documents(chunks, embeddings, index_name=index_name)
        return len(chunks)
    except Exception as e:
        logger.error(f"Ingestion Failure: {str(e)}")
        raise e

def query_resume(question: str, history: List[Dict] = None) -> str:
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
        llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.7)
        
        # Format history for the prompt
        history_str = ""
        if history:
            history_str = "\n".join([f"{m['role'].upper()}: {m['content']}" for m in history])

        template = f"""You are a professional Career Coach. Use the provided context AND conversation history to help the user.
        
        CONVERSATION HISTORY:
        {history_str}
        
        CONTEXT FROM RESUME:
        {{context}}
        
        CURRENT QUESTION: {{question}}
        
        Answer professionally and concisely:"""
        
        qa_chain = RetrievalQA.from_chain_type(
            llm, 
            retriever=vectorstore.as_retriever(search_kwargs={"k": 5}), 
            chain_type_kwargs={"prompt": PromptTemplate.from_template(template)}
        )
        return qa_chain.invoke({"query": question})["result"]
    except Exception as e:
        logger.error(f"Query Failure: {str(e)}")
        raise e

def get_career_roadmap(target_role: str) -> Dict:
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        index_name = os.getenv("PINECONE_INDEX_NAME", "careerpath-ai")
        vectorstore = PineconeVectorStore(index_name=index_name, embedding=embeddings)
        llm = ChatGoogleGenerativeAI(model="gemini-3-flash-preview", temperature=0.2)
        
        template = """
        You are a Senior Career Strategist. Analyze the user's resume context and compare it against the target role: {target_role}.
        
        OUTPUT FORMAT: You must return ONLY a JSON object with the following structure:
        {{
            "missing_skills": ["Skill 1", "Skill 2"],
            "steps": [
                {{
                    "title": "Step Title",
                    "description": "Short action-oriented instruction",
                    "difficulty": "Beginner|Intermediate|Advanced",
                    "estimated_time": "e.g. 4 weeks"
                }}
            ]
        }}

        Resume Context: {context}
        Target Role: {target_role}

        JSON Output:
        """
        
        qa_chain = RetrievalQA.from_chain_type(
            llm, 
            retriever=vectorstore.as_retriever(search_kwargs={"k": 6}), 
            chain_type_kwargs={"prompt": PromptTemplate.from_template(template)}
        )
        
        result = qa_chain.invoke({"query": f"Analyze my skills and experience to become a {target_role}"})
        clean_json = result["result"].replace("```json", "").replace("```", "").strip()
        return json.loads(clean_json)
    except Exception as e:
        logger.error(f"Roadmap Generation Failure: {str(e)}")
        raise e
