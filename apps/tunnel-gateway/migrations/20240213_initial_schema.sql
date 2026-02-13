-- Create in Supabase SQL editor

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(384), -- FastEmbed dimension
  metadata JSONB DEFAULT '{}',
  tags TEXT[],
  encrypted_data TEXT, -- For sensitive data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE, -- Soft delete
  is_favorite BOOLEAN DEFAULT false,
  source VARCHAR(50) -- 'chat', 'vault', 'import'
);

-- Ensure user_id exists if table was already created
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'memories' AND column_name = 'user_id') THEN
        ALTER TABLE memories ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  model VARCHAR(50), -- 'claude', 'gpt', 'gemini'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role VARCHAR(20), -- 'user' or 'assistant'
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  default_model VARCHAR(50) DEFAULT 'claude',
  language VARCHAR(10) DEFAULT 'en',
  settings JSONB DEFAULT '{}',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(20), -- 'feature', 'bug', 'general'
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending' -- 'pending', 'reviewed', 'resolved'
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_created_at ON memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_memories_tags ON memories USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);

-- Enable Row Level Security (RLS)
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Use existing or create new policy (Supabase might error if policy exists without IF NOT EXISTS logic which isn't standard SQL but Supabase supports DO blocks)
-- For simplicity in this file, we assume fresh creation or manual application.

-- Ideally wrap in DO block for idempotency but standard SQL is fine for initial setup.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'memories' AND policyname = 'Users can only see their own memories'
    ) THEN
        CREATE POLICY "Users can only see their own memories"
          ON memories FOR ALL
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'conversations' AND policyname = 'Users can only see their own conversations'
    ) THEN
        CREATE POLICY "Users can only see their own conversations"
          ON conversations FOR ALL
          USING (auth.uid() = user_id);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'messages' AND policyname = 'Users can only see messages from their conversations'
    ) THEN
        -- This join policy might be heavy. Alternative is adding user_id to messages too.
        -- But let's stick to the guide.
        CREATE POLICY "Users can only see messages from their conversations"
          ON messages FOR ALL
          USING (conversation_id IN (
            SELECT id FROM conversations WHERE user_id = auth.uid()
          ));
    END IF;
END
$$;
