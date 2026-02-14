"""
Identra Brain Service - AI/RAG Orchestration
FastAPI service for embeddings, semantic search, and AI interactions
MVP Version 1.0 - February 2026
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import os
from datetime import datetime
import asyncio
from contextlib import asynccontextmanager
import uvicorn

# Embedding and AI imports
from fastembed import TextEmbedding
import numpy as np

# Environment variables
EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

# Global embedding model instance
embedding_model = None


# Pydantic Models
class EmbedRequest(BaseModel):
    texts: List[str] = Field(..., description="List of texts to embed")
    model: str = Field(default=EMBEDDING_MODEL, description="Embedding model to use")


class EmbedResponse(BaseModel):
    embeddings: List[List[float]]
    dimension: int
    model: str


class SemanticSearchRequest(BaseModel):
    query: str = Field(..., description="Search query text")
    embeddings: List[List[float]] = Field(..., description="Candidate embeddings to search")
    texts: List[str] = Field(..., description="Candidate texts")
    limit: int = Field(default=10, description="Number of results to return")
    threshold: float = Field(default=0.3, description="Minimum similarity threshold")


class SearchResult(BaseModel):
    text: str
    similarity: float
    index: int


class SemanticSearchResponse(BaseModel):
    results: List[SearchResult]
    query_embedding: List[float]


class SummarizeRequest(BaseModel):
    text: str = Field(..., description="Text to summarize")
    max_length: int = Field(default=150, description="Maximum summary length in words")


class SummarizeResponse(BaseModel):
    summary: str
    original_length: int
    summary_length: int


class ExtractRequest(BaseModel):
    text: str = Field(..., description="Text to extract entities and topics from")


class Entity(BaseModel):
    text: str
    type: str
    confidence: float


class ExtractResponse(BaseModel):
    entities: List[Entity]
    topics: List[str]
    keywords: List[str]


class ChatRequest(BaseModel):
    message: str
    model: str = Field(default="claude", description="AI model to use: claude, gpt, gemini")
    context: Optional[List[str]] = Field(default=None, description="Contextual memories")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default=None)
    temperature: float = Field(default=0.7, ge=0, le=2)
    max_tokens: int = Field(default=1024, ge=1, le=4096)


class ChatResponse(BaseModel):
    response: str
    model: str
    tokens_used: Optional[int] = None
    context_used: Optional[List[str]] = None


class HealthResponse(BaseModel):
    status: str
    timestamp: str
    model_loaded: bool
    embedding_dimension: Optional[int] = None


# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize resources on startup"""
    global embedding_model
    
    print("🧠 Starting Identra Brain Service...")
    print(f"📦 Loading embedding model: {EMBEDDING_MODEL}")
    
    try:
        embedding_model = TextEmbedding(model_name=EMBEDDING_MODEL)
        print("✅ Embedding model loaded successfully")
    except Exception as e:
        print(f"⚠️  Warning: Could not load embedding model: {e}")
        embedding_model = None
    
    yield
    
    print("🛑 Shutting down Brain Service...")


# FastAPI app
app = FastAPI(
    title="Identra Brain Service",
    description="AI/RAG orchestration service for Identra memory vault",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Utility Functions
def cosine_similarity(a: List[float], b: List[float]) -> float:
    """Calculate cosine similarity between two vectors"""
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))


def get_embedding_model():
    """Dependency to ensure embedding model is loaded"""
    if embedding_model is None:
        raise HTTPException(status_code=503, detail="Embedding model not loaded")
    return embedding_model


# API Endpoints

@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    dimension = None
    model_loaded = embedding_model is not None
    
    if model_loaded:
        try:
            # Get dimension from a test embedding
            test_embed = list(embedding_model.embed(["test"]))[0]
            dimension = len(test_embed)
        except Exception:
            pass
    
    return HealthResponse(
        status="healthy" if model_loaded else "degraded",
        timestamp=datetime.utcnow().isoformat(),
        model_loaded=model_loaded,
        embedding_dimension=dimension
    )


@app.get("/health", response_model=HealthResponse)
async def health():
    """Detailed health check"""
    return await root()


@app.post("/embed", response_model=EmbedResponse)
async def embed_texts(
    request: EmbedRequest,
    model: TextEmbedding = Depends(get_embedding_model)
):
    """
    Generate embeddings for given texts
    
    Example:
    ```json
    {
        "texts": ["Hello world", "Memory vault"],
        "model": "BAAI/bge-small-en-v1.5"
    }
    ```
    """
    try:
        embeddings = []
        for embedding in model.embed(request.texts):
            embeddings.append(embedding.tolist())
        
        dimension = len(embeddings[0]) if embeddings else 0
        
        return EmbedResponse(
            embeddings=embeddings,
            dimension=dimension,
            model=request.model
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Embedding failed: {str(e)}")


@app.post("/search", response_model=SemanticSearchResponse)
async def semantic_search(
    request: SemanticSearchRequest,
    model: TextEmbedding = Depends(get_embedding_model)
):
    """
    Perform semantic search over candidate texts
    
    Returns top-k most similar texts to the query
    """
    try:
        # Generate query embedding
        query_embeddings = list(model.embed([request.query]))
        query_embedding = query_embeddings[0].tolist()
        
        # Calculate similarities
        results = []
        for idx, (text, candidate_embedding) in enumerate(zip(request.texts, request.embeddings)):
            similarity = cosine_similarity(query_embedding, candidate_embedding)
            
            if similarity >= request.threshold:
                results.append(SearchResult(
                    text=text,
                    similarity=similarity,
                    index=idx
                ))
        
        # Sort by similarity (descending) and limit
        results.sort(key=lambda x: x.similarity, reverse=True)
        results = results[:request.limit]
        
        return SemanticSearchResponse(
            results=results,
            query_embedding=query_embedding
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.post("/summarize", response_model=SummarizeResponse)
async def summarize_text(request: SummarizeRequest):
    """
    Summarize given text using extractive summarization
    
    For MVP, uses simple sentence ranking. In production, use transformer models.
    """
    try:
        text = request.text
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if len(sentences) <= 3:
            # Text is already short
            summary = text
        else:
            # Simple extractive summarization: take first and last sentences plus middle
            num_sentences = min(3, max(1, request.max_length // 20))
            if num_sentences == 1:
                summary = sentences[0] + '.'
            elif num_sentences == 2:
                summary = sentences[0] + '. ' + sentences[-1] + '.'
            else:
                mid_idx = len(sentences) // 2
                summary = sentences[0] + '. ' + sentences[mid_idx] + '. ' + sentences[-1] + '.'
        
        return SummarizeResponse(
            summary=summary,
            original_length=len(text.split()),
            summary_length=len(summary.split())
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization failed: {str(e)}")


@app.post("/extract", response_model=ExtractResponse)
async def extract_entities(request: ExtractRequest):
    """
    Extract entities, topics, and keywords from text
    
    For MVP, uses simple heuristics. In production, use NER models.
    """
    try:
        text = request.text
        words = text.split()
        
        # Simple capitalized word extraction as entities (very basic)
        entities = []
        for word in words:
            if word and word[0].isupper() and len(word) > 2:
                entities.append(Entity(
                    text=word.strip('.,!?'),
                    type="ENTITY",
                    confidence=0.6
                ))
        
        # Extract keywords (words longer than 5 chars, not too common)
        common_words = {'that', 'this', 'with', 'from', 'have', 'been', 'were', 'would', 'could', 'their', 'there'}
        keywords = [
            word.lower().strip('.,!?')
            for word in words
            if len(word) > 5 and word.lower() not in common_words
        ]
        keywords = list(set(keywords))[:10]  # Unique, limit to 10
        
        # Topics are similar to keywords for now
        topics = keywords[:5]
        
        return ExtractResponse(
            entities=entities[:20],  # Limit entities
            topics=topics,
            keywords=keywords
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest):
    """
    Send chat message to AI with optional context
    
    Routes to appropriate AI provider based on model selection
    """
    try:
        # For MVP, return mock response
        # In production, implement actual API calls to Anthropic/OpenAI/Google
        
        if request.model == "claude":
            if not ANTHROPIC_API_KEY:
                return ChatResponse(
                    response=f"[Mock Claude Response] I understand you said: '{request.message}'. This is a demo response as ANTHROPIC_API_KEY is not configured.",
                    model="claude-mock",
                    tokens_used=None,
                    context_used=request.context
                )
            # TODO: Implement actual Anthropic API call
            # import anthropic
            # client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
            # ...
            
        elif request.model == "gpt":
            if not OPENAI_API_KEY:
                return ChatResponse(
                    response=f"[Mock GPT Response] I heard you: '{request.message}'. Configure OPENAI_API_KEY for real responses.",
                    model="gpt-mock",
                    tokens_used=None,
                    context_used=request.context
                )
            # TODO: Implement OpenAI API call
            
        elif request.model == "gemini":
            if not GOOGLE_API_KEY:
                return ChatResponse(
                    response=f"[Mock Gemini Response] Your message: '{request.message}'. Set GOOGLE_API_KEY for actual responses.",
                    model="gemini-mock",
                    tokens_used=None,
                    context_used=request.context
                )
            # TODO: Implement Google Gemini API call
        
        # Default mock response
        return ChatResponse(
            response=f"Received your message: '{request.message}'. AI integration in progress.",
            model=f"{request.model}-mock",
            tokens_used=None,
            context_used=request.context
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


@app.post("/suggest")
async def suggest_related_memories(
    memory_id: str,
    embedding: List[float],
    limit: int = 5
) -> Dict[str, Any]:
    """
    Suggest related memories based on embedding similarity
    
    In production, this would query the database directly
    """
    return {
        "memory_id": memory_id,
        "suggested": [],
        "message": "Memory suggestions require database integration"
    }


# Development server
if __name__ == "__main__":
    port = int(os.getenv("BRAIN_SERVICE_PORT", 8001))
    
    print(f"""
╔══════════════════════════════════════════╗
║   Identra Brain Service - MVP v1.0      ║
║   AI/RAG Orchestration                   ║
╚══════════════════════════════════════════╝

🌐 Server: http://localhost:{port}
📚 Docs:   http://localhost:{port}/docs
🔬 Health: http://localhost:{port}/health

📦 Embedding Model: {EMBEDDING_MODEL}
🤖 AI Keys Configured:
   - Claude (Anthropic): {'✓' if ANTHROPIC_API_KEY else '✗'}
   - GPT (OpenAI):       {'✓' if OPENAI_API_KEY else '✗'}
   - Gemini (Google):    {'✓' if GOOGLE_API_KEY else '✗'}

Starting server...
""")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    )
