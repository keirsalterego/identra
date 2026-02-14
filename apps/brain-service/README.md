# Identra Brain Service

AI/RAG orchestration service for semantic search, embeddings, and intelligent memory retrieval.

## Features

- 🧮 **Text Embeddings**: Generate vector embeddings using FastEmbed (BAAI/bge-small-en-v1.5)
- 🔍 **Semantic Search**: Find relevant memories using cosine similarity
- 📝 **Summarization**: Extract key points from long text
- 🏷️ **Entity Extraction**: Identify entities, topics, and keywords
- 🤖 **AI Chat**: Interface with Claude, GPT, and Gemini (with context)
- 🔗 **Memory Suggestions**: Recommend related memories

## Quick Start

### 1. Install Dependencies

```bash
cd apps/brain-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file:

```bash
# Optional: AI API Keys (for production)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...

# Service Configuration
BRAIN_SERVICE_PORT=8001
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
```

### 3. Run Service

```bash
# Development mode (auto-reload)
python main.py

# Or using uvicorn directly
uvicorn main:app --reload --port 8001
```

### 4. Test API

Visit: http://localhost:8001/docs

## API Endpoints

### Health Check

```bash
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-14T10:30:00",
  "model_loaded": true,
  "embedding_dimension": 384
}
```

### Generate Embeddings

```bash
POST /embed
Content-Type: application/json

{
  "texts": ["Hello world", "Memory vault"],
  "model": "BAAI/bge-small-en-v1.5"
}
```

Response:
```json
{
  "embeddings": [[0.123, -0.456, ...], [0.789, -0.012, ...]],
  "dimension": 384,
  "model": "BAAI/bge-small-en-v1.5"
}
```

### Semantic Search

```bash
POST /search
Content-Type: application/json

{
  "query": "password reset flow",
  "embeddings": [[...], [...], [...]],
  "texts": ["User login", "Password reset", "User registration"],
  "limit": 10,
  "threshold": 0.3
}
```

Response:
```json
{
  "results": [
    {
      "text": "Password reset",
      "similarity": 0.89,
      "index": 1
    },
    {
      "text": "User registration",
      "similarity": 0.67,
      "index": 2
    }
  ],
  "query_embedding": [0.123, -0.456, ...]
}
```

### Summarize Text

```bash
POST /summarize
Content-Type: application/json

{
  "text": "Long text here...",
  "max_length": 150
}
```

### Extract Entities

```bash
POST /extract
Content-Type: application/json

{
  "text": "John works at Google in California."
}
```

Response:
```json
{
  "entities": [
    {"text": "John", "type": "ENTITY", "confidence": 0.6},
    {"text": "Google", "type": "ENTITY", "confidence": 0.6}
  ],
  "topics": ["Google", "California"],
  "keywords": ["works", "California"]
}
```

### Chat with AI

```bash
POST /chat
Content-Type: application/json

{
  "message": "What's the weather like?",
  "model": "claude",
  "context": ["Previous context..."],
  "temperature": 0.7,
  "max_tokens": 1024
}
```

## Architecture

```
┌─────────────────────────────────────┐
│      Identra Brain Service          │
├─────────────────────────────────────┤
│  FastAPI Server (Python)            │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  Embedding Engine            │  │
│  │  (FastEmbed + BGE-small)     │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  AI Providers                │  │
│  │  • Anthropic Claude          │  │
│  │  • OpenAI GPT                │  │
│  │  • Google Gemini             │  │
│  └──────────────────────────────┘  │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  NLP Pipeline                │  │
│  │  • Summarization             │  │
│  │  • Entity Extraction         │  │
│  │  • Semantic Search           │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
         ↕ HTTP/JSON
┌─────────────────────────────────────┐
│   Tunnel Gateway (Rust)             │
│   • gRPC endpoints                   │
│   • Request routing                  │
│   • Authentication                   │
└─────────────────────────────────────┘
```

## Embedding Model

**BAAI/bge-small-en-v1.5**
- Dimension: 384
- Size: ~130MB
- Speed: Fast (CPU optimized via FastEmbed)
- Quality: State-of-the-art for general-purpose retrieval

## Performance

- Embedding generation: ~50-100 texts/second (CPU)
- Search latency: <100ms for 10k memories
- Memory usage: ~500MB (model + runtime)

## Development

### Running Tests

```bash
# Install dev dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/
```

### Adding New Endpoints

1. Define Pydantic models
2. Create endpoint function with `@app.post()` decorator
3. Add error handling
4. Document in this README

### Deployment

**Option 1: Railway**
```bash
railway up
```

**Option 2: Fly.io**
```bash
fly deploy
```

**Option 3: Docker**
```bash
docker build -t identra-brain .
docker run -p 8001:8001 identra-brain
```

## TODO for Production

- [ ] Implement actual AI provider integrations (Claude, GPT, Gemini)
- [ ] Add caching layer (Redis) for embeddings
- [ ] Implement batch processing for large datasets
- [ ] Add rate limiting and authentication
- [ ] Use proper NER models for entity extraction
- [ ] Implement abstractive summarization with transformers
- [ ] Add monitoring and observability (Sentry, DataDog)
- [ ] Optimize embedding generation with GPU support
- [ ] Add conversation memory management
- [ ] Implement streaming responses for chat

## Troubleshooting

**Model Download Issues:**
```bash
# Manually download model
python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5')"
```

**Port Already in Use:**
```bash
# Change port in .env or command line
BRAIN_SERVICE_PORT=8002 python main.py
```

**Import Errors:**
```bash
# Ensure you're in the virtual environment
source venv/bin/activate
pip install -r requirements.txt
```

## License

Part of Identra project - Confidential Memory Vault
