-- CareerPath AI Supabase Database Schema
-- Phase 8: Multi-User Persistent History

-- 1. Create the chat_history table
CREATE TABLE chat_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  message TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'model')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policy for SELECT (Users can only see their own history)
CREATE POLICY "Users can view own chat history"
ON chat_history
FOR SELECT
USING (auth.uid() = user_id);

-- 4. Create RLS Policy for INSERT (Users can only insert their own records)
CREATE POLICY "Users can insert own chat records"
ON chat_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 5. Index for performance
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
