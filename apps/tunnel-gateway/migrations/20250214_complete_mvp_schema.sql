-- Identra MVP Complete Database Schema
-- Run this in Supabase SQL Editor
-- Last Updated: 2026-02-14

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- User profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{
    "theme": "dark",
    "default_model": "claude",
    "language": "en",
    "notifications_enabled": true,
    "email_notifications": false,
    "shortcuts": {
      "launcher": "CommandOrControl+K",
      "new_chat": "CommandOrControl+N",
      "search": "CommandOrControl+F"
    }
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT false,
  beta_tester_since TIMESTAMP WITH TIME ZONE
);

-- Memories table (core feature)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  summary TEXT, -- AI-generated summary for long content
  embedding vector(384), -- FastEmbed BAAI/bge-small-en-v1.5 dimension
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  encrypted_data TEXT, -- For sensitive data (optional)
  source VARCHAR(50) DEFAULT 'manual', -- 'chat', 'vault', 'import', 'manual'
  is_favorite BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE -- Soft delete
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  model VARCHAR(50) DEFAULT 'claude', -- 'claude', 'gpt', 'gemini'
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  is_pinned BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  folder VARCHAR(100), -- For organization
  tags TEXT[] DEFAULT '{}',
  message_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_message_at TIMESTAMP WITH TIME ZONE
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model VARCHAR(50), -- Which model generated this (for assistant messages)
  metadata JSONB DEFAULT '{}', -- tokens, latency, etc.
  embedding vector(384), -- For semantic search within conversations
  context_memories UUID[] DEFAULT '{}', -- IDs of memories used in context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memory relationships (for linking related memories)
CREATE TABLE IF NOT EXISTS memory_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  target_memory_id UUID NOT NULL REFERENCES memories(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) DEFAULT 'related', -- 'related', 'contradicts', 'clarifies', 'extends'
  strength REAL DEFAULT 0.5 CHECK (strength >= 0 AND strength <= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(source_memory_id, target_memory_id)
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  type VARCHAR(20) CHECK (type IN ('feature', 'bug', 'general', 'praise')),
  title TEXT,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'closed')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions (for tracking active sessions)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info JSONB DEFAULT '{}', -- OS, app version, etc.
  ip_address INET,
  refresh_token_hash TEXT, -- Hashed refresh token
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Import history (track imports from external sources)
CREATE TABLE IF NOT EXISTS import_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source VARCHAR(50) NOT NULL, -- 'notion', 'evernote', 'json', 'csv'
  filename TEXT,
  status VARCHAR(20) DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  total_items INTEGER DEFAULT 0,
  imported_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  error_log JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- System metrics (for admin dashboard)
CREATE TABLE IF NOT EXISTS system_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_value REAL NOT NULL,
  metric_metadata JSONB DEFAULT '{}',
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  target_user_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Memory indexes
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_updated_at ON memories(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_memories_source ON memories(source);
CREATE INDEX IF NOT EXISTS idx_memories_favorite ON memories(user_id, is_favorite) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS idx_memories_deleted ON memories(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_memories_embedding ON memories USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Conversation indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_pinned ON conversations(user_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_conversations_folder ON conversations(user_id, folder) WHERE folder IS NOT NULL;

-- Message indexes
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_embedding ON messages USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Memory links indexes
CREATE INDEX IF NOT EXISTS idx_memory_links_source ON memory_links(source_memory_id);
CREATE INDEX IF NOT EXISTS idx_memory_links_target ON memory_links(target_memory_id);

-- Session indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON user_sessions(expires_at);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_memories_content_trgm ON memories USING gin(content gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_conversations_title_trgm ON conversations USING gin(title gin_trgm_ops);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Memory policies
CREATE POLICY "Users can view their own memories"
  ON memories FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can insert their own memories"
  ON memories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories"
  ON memories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories"
  ON memories FOR DELETE
  USING (auth.uid() = user_id);

-- Conversation policies
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
  ON conversations FOR DELETE
  USING (auth.uid() = user_id);

-- Message policies
CREATE POLICY "Users can view messages from their conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert messages to their conversations"
  ON messages FOR INSERT
  WITH CHECK (conversation_id IN (
    SELECT id FROM conversations WHERE user_id = auth.uid()
  ));

-- Memory links policies
CREATE POLICY "Users can view their memory links"
  ON memory_links FOR SELECT
  USING (
    source_memory_id IN (SELECT id FROM memories WHERE user_id = auth.uid())
    AND target_memory_id IN (SELECT id FROM memories WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage their memory links"
  ON memory_links FOR ALL
  USING (
    source_memory_id IN (SELECT id FROM memories WHERE user_id = auth.uid())
    AND target_memory_id IN (SELECT id FROM memories WHERE user_id = auth.uid())
  );

-- Feedback policies (users can see and edit their own feedback)
CREATE POLICY "Users can view their own feedback"
  ON feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own feedback"
  ON feedback FOR UPDATE
  USING (auth.uid() = user_id);

-- Session policies
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

-- Import history policies
CREATE POLICY "Users can view their import history"
  ON import_history FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feedback_updated_at BEFORE UPDATE ON feedback
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update conversation message count and last_message_at
CREATE OR REPLACE FUNCTION update_conversation_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET 
    message_count = message_count + 1,
    last_message_at = NEW.created_at,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_stats_trigger AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_stats();

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function for semantic search
CREATE OR REPLACE FUNCTION search_memories_semantic(
  p_user_id UUID,
  p_embedding vector(384),
  p_limit INTEGER DEFAULT 10,
  p_threshold REAL DEFAULT 0.3
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  summary TEXT,
  tags TEXT[],
  similarity REAL,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.content,
    m.summary,
    m.tags,
    1 - (m.embedding <=> p_embedding) AS similarity,
    m.created_at
  FROM memories m
  WHERE 
    m.user_id = p_user_id 
    AND m.deleted_at IS NULL
    AND (1 - (m.embedding <=> p_embedding)) > p_threshold
  ORDER BY m.embedding <=> p_embedding
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default feature flags
INSERT INTO feature_flags (name, enabled, description, rollout_percentage) VALUES
  ('oauth_google', true, 'Enable Google OAuth login', 100),
  ('oauth_github', true, 'Enable GitHub OAuth login', 100),
  ('voice_input', false, 'Enable voice input for chat', 0),
  ('memory_sharing', false, 'Enable encrypted memory sharing', 0),
  ('advanced_analytics', false, 'Enable advanced analytics dashboard', 0),
  ('import_notion', false, 'Enable Notion import', 0),
  ('export_markdown', true, 'Enable Markdown export', 100)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- View for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  up.id,
  up.username,
  up.created_at,
  up.last_login,
  COUNT(DISTINCT m.id) as total_memories,
  COUNT(DISTINCT c.id) as total_conversations,
  COUNT(DISTINCT msg.id) as total_messages
FROM user_profiles up
LEFT JOIN memories m ON up.id = m.user_id AND m.deleted_at IS NULL
LEFT JOIN conversations c ON up.id = c.user_id
LEFT JOIN messages msg ON c.id = msg.conversation_id
GROUP BY up.id, up.username, up.created_at, up.last_login;

-- ============================================
-- CLEANUP FUNCTIONS
-- ============================================

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM user_sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run this manually or via cron)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions()');

COMMIT;
