# Database Migrations

This directory contains SQL migration files for the Identra database schema.

## Running Migrations

### Option 1: Supabase SQL Editor (Recommended for MVP)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the contents of `20250214_complete_mvp_schema.sql`
5. Click **Run**

### Option 2: Using `psql` Command Line

```bash
# Using the DATABASE_URL from .env
psql $DATABASE_URL -f migrations/20250214_complete_mvp_schema.sql
```

### Option 3: Programmatic Migration (Future)

```rust
// TODO: Implement migration runner in tunnel-gateway
sqlx::migrate!("./migrations").run(&pool).await?;
```

## Migration Files

### `20250214_complete_mvp_schema.sql`
Complete MVP database schema including:
- User profiles with preferences
- Memories table with vector embeddings
- Conversations and messages
- Memory relationship graph
- Feedback system
- User sessions tracking
- Import history
- System metrics and feature flags
- RLS policies for security
- Indexes for performance
- Helper functions and triggers

## Verifying Migration Success

After running the migration, verify in Supabase:

```sql
-- Check tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verify vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Test feature flags
SELECT * FROM feature_flags;
```

## Schema Overview

```
auth.users (Supabase managed)
  ↓
user_profiles → preferences, settings
  ↓
  ├── memories → content + vector embeddings
  │     ↓
  │   memory_links → relationships between memories
  │
  ├── conversations → chat sessions
  │     ↓
  │   messages → individual messages with context
  │
  ├── feedback → user feedback
  ├── user_sessions → active sessions
  └── import_history → import tracking
```

## Performance Notes

- **Vector indexes**: Using IVFFlat with 100 lists for embeddings (tune based on data size)
- **Text search**: Using pg_trgm for fuzzy text search
- **Query optimization**: All foreign keys and frequently queried columns are indexed
- **RLS**: All policies enforce user-level data isolation

## Security Notes

- Row Level Security (RLS) enabled on all user tables
- Users can only access their own data
- Service role key required for admin operations
- Encrypted data column available for sensitive memories

## Next Steps

1. ✅ Run the migration
2. Configure authentication in Supabase dashboard
3. Test with a user signup/login flow
4. Verify RLS policies work as expected
