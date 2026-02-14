# Database Migration Guide

## Problem: "column does not exist" Error

If you see errors like `ERROR: column "source" does not exist`, it means your database tables exist from an earlier schema version and need to be updated.

---

## Solution 1: Run Update Migration (Recommended - Non-Destructive)

This adds missing columns to existing tables without losing data.

### Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project
   - Navigate to **SQL Editor**
   - Click **New Query**

2. **Run the Update Script**
   ```sql
   -- Copy and paste contents of:
   apps/tunnel-gateway/migrations/20250214_alter_existing_schema.sql
   ```

3. **Click Run**
   - Should complete in 2-5 seconds
   - Check for "Migration completed successfully!" message

4. **Verify**
   ```sql
   -- Check memories table structure
   SELECT column_name, data_type, column_default
   FROM information_schema.columns
   WHERE table_name = 'memories'
   ORDER BY ordinal_position;
   
   -- Should show: id, user_id, content, summary, embedding, metadata, 
   --              tags, encrypted_data, source, is_favorite, is_archived, 
   --              created_at, updated_at, deleted_at
   ```

---

## Solution 2: Fresh Start (Destructive - Loses Data)

Only use this if you're in early development and can afford to lose data.

### Steps:

1. **Drop All Tables** (⚠️ **WARNING: Deletes all data**)
   ```sql
   -- In Supabase SQL Editor
   DROP TABLE IF EXISTS import_history CASCADE;
   DROP TABLE IF EXISTS user_sessions CASCADE;
   DROP TABLE IF EXISTS feedback CASCADE;
   DROP TABLE IF EXISTS memory_links CASCADE;
   DROP TABLE IF EXISTS messages CASCADE;
   DROP TABLE IF EXISTS conversations CASCADE;
   DROP TABLE IF EXISTS memories CASCADE;
   DROP TABLE IF EXISTS user_profiles CASCADE;
   DROP TABLE IF EXISTS system_metrics CASCADE;
   DROP TABLE IF EXISTS feature_flags CASCADE;
   
   -- Drop functions
   DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
   DROP FUNCTION IF EXISTS update_conversation_stats() CASCADE;
   DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
   DROP FUNCTION IF EXISTS search_memories_semantic(UUID, vector, INTEGER, REAL) CASCADE;
   DROP FUNCTION IF EXISTS cleanup_expired_sessions() CASCADE;
   
   -- Drop views
   DROP VIEW IF EXISTS user_statistics CASCADE;
   ```

2. **Run Complete Schema**
   ```sql
   -- Copy and paste contents of:
   apps/tunnel-gateway/migrations/20250214_complete_mvp_schema.sql
   ```

3. **Verify**
   ```sql
   -- Should show all 10 tables
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

---

## Solution 3: Command Line Migration (Advanced)

Using `psql` command line tool:

```bash
# Get your DATABASE_URL from .env
export DATABASE_URL="postgres://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Run update migration
psql $DATABASE_URL -f apps/tunnel-gateway/migrations/20250214_alter_existing_schema.sql

# Or fresh install (destructive)
# psql $DATABASE_URL -f apps/tunnel-gateway/migrations/20250214_complete_mvp_schema.sql
```

---

## Common Errors & Fixes

### Error: "relation already exists"
**Cause:** Table exists from previous run  
**Fix:** Use Solution 1 (update migration)

### Error: "constraint already exists"
**Cause:** Policy or constraint exists  
**Fix:** Script includes `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object` to handle this

### Error: "column already exists"
**Cause:** Column was added in a previous run  
**Fix:** Script uses `ADD COLUMN IF NOT EXISTS` - safe to re-run

### Error: "extension does not exist"
**Cause:** pgvector extension not enabled  
**Fix:** Run in SQL Editor:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied for schema public"
**Cause:** Insufficient permissions  
**Fix:** Make sure you're using the service role key or running in Supabase SQL Editor

---

## Migration Strategy for Production

For production deployments, follow this pattern:

### 1. Version Control Migrations
```
migrations/
├── 20250214_001_initial_schema.sql
├── 20250214_002_add_user_profiles.sql
├── 20250214_003_add_memory_features.sql
└── 20250214_004_add_conversation_features.sql
```

### 2. Migration Tracking Table
```sql
CREATE TABLE schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Idempotent Migrations
- Always use `IF NOT EXISTS`, `IF EXISTS`
- Handle duplicate object exceptions
- Make migrations re-runnable

### 4. Rollback Strategy
```sql
-- Each migration should have a corresponding rollback
-- migrations/20250214_001_initial_schema.sql
-- migrations/20250214_001_initial_schema_rollback.sql
```

---

## Testing Migrations

Before running in production:

### 1. Test on Local Database
```bash
# Start local Postgres
docker run -d \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:15-alpine

# Test migration
psql postgresql://postgres:postgres@localhost:5432/postgres \
  -f apps/tunnel-gateway/migrations/20250214_complete_mvp_schema.sql
```

### 2. Test on Staging Environment
- Create a staging Supabase project
- Run migrations
- Verify with test data
- Check application functionality

### 3. Backup Production Before Migration
```bash
# Backup (Supabase Pro plan includes automatic backups)
# Or manual backup:
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## Current Migration Status

After running the update migration, your schema should have:

### Tables (10)
- ✅ memories (with source, is_favorite, is_archived, deleted_at)
- ✅ conversations (with system_prompt, temperature, is_pinned, is_archived, folder, tags, message_count, last_message_at)
- ✅ messages (with metadata, embedding, context_memories)
- ✅ user_profiles
- ✅ memory_links
- ✅ feedback
- ✅ user_sessions
- ✅ import_history
- ✅ system_metrics
- ✅ feature_flags

### Indexes (23+)
- Vector indexes for semantic search
- Text search indexes (pg_trgm)
- Performance indexes on foreign keys
- Composite indexes for common queries

### RLS Policies (20+)
- All user tables secured
- User-level data isolation
- Proper permission boundaries

### Functions (5)
- update_updated_at_column()
- update_conversation_stats()
- handle_new_user()
- search_memories_semantic()
- cleanup_expired_sessions()

### Views (1)
- user_statistics

---

## Next Steps After Migration

1. **Verify Schema**
   ```sql
   -- Count tables
   SELECT COUNT(*) FROM information_schema.tables 
   WHERE table_schema = 'public';
   -- Should return 10
   
   -- Check RLS is enabled
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   -- All should show 't' (true)
   ```

2. **Test with Sample Data**
   ```sql
   -- Assumes you have a user created via Supabase Auth
   INSERT INTO memories (user_id, content, tags, source)
   VALUES (
     auth.uid(),
     'Test memory content',
     ARRAY['test', 'demo'],
     'manual'
   );
   
   SELECT * FROM memories WHERE user_id = auth.uid();
   ```

3. **Update Application Code**
   - Ensure tunnel-gateway uses updated schema
   - Test CRUD operations
   - Verify RLS policies work correctly

4. **Monitor Performance**
   ```sql
   -- Check index usage
   SELECT schemaname, tablename, indexname, idx_scan
   FROM pg_stat_user_indexes
   ORDER BY idx_scan DESC;
   ```

---

## Support

If issues persist:

1. Check PostgreSQL logs in Supabase dashboard
2. Verify environment variables in `.env`
3. Review [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
4. Check Supabase docs: https://supabase.com/docs

---

**Migration Complete!** Your database is now ready for the Identra MVP. 🚀
