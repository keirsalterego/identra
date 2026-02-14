# Identra MVP Deployment Guide
**Quick deployment guide for all completed components**

---

## Prerequisites

### Required Software
- [x] Node.js 18+ and Yarn
- [x] Rust 1.75+
- [x] Python 3.10+
- [x] Just (task runner): `cargo install just`
- [x] PostgreSQL client (psql)

### Required Accounts
- [x] Supabase account (https://supabase.com)
- [ ] Anthropic API key (optional for now)
- [ ] OpenAI API key (optional for now)
- [ ] Google AI API key (optional for now)

---

## Step-by-Step Deployment

### 1. Database Setup (5 minutes)

#### A. Create Supabase Project
1. Go to https://supabase.com
2. Click "New Project"
3. Name: `identra-mvp`
4. Set a strong database password (save it!)
5. Choose a region close to your users
6. Wait for project initialization (~2 minutes)

#### B. Get Credentials
1. In Supabase dashboard → Settings → API
2. Copy these values to `.env`:
   ```bash
   SUPABASE_URL=https://[your-project-ref].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

#### C. Run Migration
1. In Supabase dashboard → SQL Editor
2. Click "New Query"
3. Copy contents of `apps/tunnel-gateway/migrations/20250214_complete_mvp_schema.sql`
4. Paste and click "Run"
5. Verify success: Should see "Success. No rows returned"

#### D. Verify Schema
```sql
-- Run this in SQL Editor to verify
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Should show: conversations, feedback, feature_flags, import_history, 
-- memories, memory_links, messages, system_metrics, user_profiles, user_sessions
```

#### E. Configure Database URL
```bash
# Get connection string from Supabase → Settings → Database
# Format: postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Add to .env
DATABASE_URL=postgres://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

---

### 2. Brain Service Deployment (10 minutes)

#### A. Install Dependencies
```bash
cd apps/brain-service

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install packages
pip install -r requirements.txt
# Wait 2-3 minutes for fastembed to download model (~130MB)
```

#### B. Configure Environment
```bash
# Optional: Add AI API keys to .env (can skip for now)
ANTHROPIC_API_KEY=sk-ant-...  # Optional
OPENAI_API_KEY=sk-...          # Optional
GOOGLE_API_KEY=...             # Optional

# Service configuration
BRAIN_SERVICE_PORT=8001
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
```

#### C. Start Service
```bash
python main.py

# Should see:
# ╔══════════════════════════════════════════╗
# ║   Identra Brain Service - MVP v1.0      ║
# ╚══════════════════════════════════════════╝
# 🌐 Server: http://localhost:8001
```

#### D. Verify Health
```bash
# In another terminal:
curl http://localhost:8001/health

# Should return:
# {
#   "status": "healthy",
#   "model_loaded": true,
#   "embedding_dimension": 384
# }
```

#### E. Test Embedding
```bash
curl -X POST http://localhost:8001/embed \
  -H "Content-Type: application/json" \
  -d '{"texts": ["Hello world"]}'

# Should return embeddings array
```

---

### 3. Tunnel Gateway Deployment (5 minutes)

#### A. Build and Run
```bash
cd apps/tunnel-gateway

# Build (first time takes ~5 minutes)
cargo build --release

# Or use Just task runner
just dev-gateway

# Should see:
# 🔌 Connecting to Supabase...
# ✅ Connected to Supabase Postgres
# 🚀 Tunnel Gateway started on [::]:50051
```

#### B. Verify Connection
```bash
# Check logs for successful database connection
# Should NOT see any connection errors
```

---

### 4. Desktop App Deployment (10 minutes)

#### A. Install Frontend Dependencies
```bash
cd clients/ghost-desktop

# Install Node packages
yarn install
# Wait 2-3 minutes
```

#### B. Build Tauri App
```bash
# Development mode (hot reload)
yarn tauri dev

# Or use Just task runner from root
just dev-desktop
```

#### C. Expected Behavior
- Window opens with Login page
- Dark theme applied correctly
- No console errors
- Smooth animations on hover

#### D. Test Login Flow
1. Click "Create via Invitation" → Register page
2. Enter username, email, password
3. Watch password strength indicator update
4. Submit form → Should call backend
5. On success → Redirects to login

---

### 5. Complete System Test

#### A. Start All Services
```bash
# Terminal 1: Brain Service
cd apps/brain-service && source venv/bin/activate && python main.py

# Terminal 2: Tunnel Gateway
cd apps/tunnel-gateway && cargo run

# Terminal 3: Desktop App
cd clients/ghost-desktop && yarn tauri dev
```

#### B. Health Check Checklist
- [ ] Brain service responds at http://localhost:8001/health
- [ ] Brain service docs accessible at http://localhost:8001/docs
- [ ] Tunnel gateway shows "Connected to Supabase"
- [ ] Desktop app opens without errors
- [ ] Login page displays correctly
- [ ] Register page displays correctly

---

## Production Deployment

### Option 1: Local Development (Current)
✅ All three services running locally
- Brain: localhost:8001
- Gateway: localhost:50051
- Desktop: Electron window

### Option 2: Hybrid (Recommended for Beta)
- Brain Service → Deploy to Railway/Fly.io
- Tunnel Gateway → Deploy to Railway/Fly.io
- Desktop App → Package and distribute
- Database → Supabase (already cloud)

### Option 3: Full Cloud (Future)
- All services containerized
- Kubernetes orchestration
- AWS Nitro Enclaves for vault
- CDN for assets

---

## Packaging Desktop App

### macOS
```bash
cd clients/ghost-desktop
yarn tauri build --target universal-apple-darwin

# Output: src-tauri/target/release/bundle/dmg/Identra.dmg
```

### Windows
```bash
yarn tauri build --target x86_64-pc-windows-msvc

# Output: src-tauri/target/release/bundle/msi/Identra_0.1.0_x64_en-US.msi
```

### Linux
```bash
yarn tauri build --target x86_64-unknown-linux-gnu

# Output: src-tauri/target/release/bundle/deb/identra_0.1.0_amd64.deb
```

---

## Environment Variables Reference

### Complete `.env` File
```bash
# ================================
# DATABASE
# ================================
DATABASE_URL=postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# ================================
# SUPABASE AUTH
# ================================
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_ANON_KEY=[ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[SERVICE_ROLE_KEY]

# ================================
# AI PROVIDERS (Optional for now)
# ================================
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GOOGLE_API_KEY=

# ================================
# BRAIN SERVICE
# ================================
BRAIN_SERVICE_PORT=8001
BRAIN_SERVICE_URL=http://localhost:8001
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5

# ================================
# ADMIN (Optional)
# ================================
ADMIN_USERNAME=admin@identra.ai
ADMIN_PASSWORD=[SECURE_PASSWORD]
```

---

## Troubleshooting

### Database Connection Failed
```bash
# Test connection manually
psql $DATABASE_URL -c "SELECT 1;"

# If fails, check:
# 1. Correct password in DATABASE_URL
# 2. Project is not paused in Supabase
# 3. Firewall allows port 5432
```

### Brain Service Model Download Stuck
```bash
# Manually download model
python -c "from fastembed import TextEmbedding; TextEmbedding('BAAI/bge-small-en-v1.5')"

# If fails, check internet connection
# Model is ~130MB
```

### Tauri Build Fails
```bash
# Update Rust
rustup update

# Clear cache
cd clients/ghost-desktop/src-tauri
cargo clean

# Rebuild
cargo build
```

### Port Already in Use
```bash
# Brain service
BRAIN_SERVICE_PORT=8002 python main.py

# Or kill existing process
lsof -ti:8001 | xargs kill -9
```

---

## Monitoring & Logs

### Check Service Logs
```bash
# Brain service
tail -f apps/brain-service/logs/*.log

# Tunnel gateway
RUST_LOG=debug cargo run

# Desktop app
# Open DevTools: CMD+Option+I (macOS) or Ctrl+Shift+I (Windows)
```

### Health Checks
```bash
# Brain service
curl http://localhost:8001/health

# Database
psql $DATABASE_URL -c "SELECT COUNT(*) FROM memories;"

# Feature flags
psql $DATABASE_URL -c "SELECT * FROM feature_flags;"
```

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Rotate Supabase service role key
- [ ] Enable 2FA on Supabase account
- [ ] Set up RLS policies correctly
- [ ] Test with real user accounts
- [ ] Enable HTTPS for all endpoints
- [ ] Add rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Configure CORS properly
- [ ] Review and test all RLS policies
- [ ] Encrypt sensitive environment variables

---

## Backup & Recovery

### Database Backup
```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup_20260214.sql
```

### Supabase Automatic Backups
- Supabase Pro plan includes daily backups
- Retention: 7 days (Pro), 90 days (Team/Enterprise)

---

## Performance Benchmarks

### Expected Performance (MVP)
- Database query: < 100ms
- Embedding generation: ~50-100 texts/second
- Semantic search: < 300ms (10k memories)
- App startup: < 2 seconds
- Memory usage: ~500MB

### Load Testing
```bash
# Test brain service
# Install: pip install locust
locust -f tests/load_test.py --host http://localhost:8001
```

---

## Next Steps After Deployment

1. **Test with real users** (start with 10)
2. **Monitor error logs** closely
3. **Gather feedback** early and often
4. **Implement missing features** from MVP guide
5. **Optimize performance** based on metrics
6. **Prepare for beta launch** (500 users)

---

## Support

- **Documentation:** See README files in each component
- **Issues:** Check [MVP_IMPLEMENTATION_STATUS.md](MVP_IMPLEMENTATION_STATUS.md)
- **Architecture:** See [CHAT_SETUP.md](CHAT_SETUP.md)
- **Contributing:** See [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

**Deployment Completed Successfully! 🎉**

Your Identra MVP is now running with:
- ✅ Production database schema
- ✅ Authentication system
- ✅ AI/RAG service
- ✅ Beautiful desktop UI
- ✅ Secure infrastructure

Ready to start building memories! 🚀
