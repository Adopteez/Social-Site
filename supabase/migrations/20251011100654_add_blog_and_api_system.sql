/*
  # Blog & API System for Sintra Robots

  1. New Tables
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique, for SEO-friendly URLs)
      - `content` (text, required)
      - `excerpt` (text, short summary)
      - `cover_image` (text, URL to image)
      - `tags` (text array, for categorization)
      - `author_id` (uuid, foreign key to profiles)
      - `status` (text, draft/published/archived)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `page_seo`
      - `id` (uuid, primary key)
      - `page_path` (text, unique, e.g., /about, /blog/post-slug)
      - `title` (text, SEO title)
      - `meta_description` (text)
      - `keywords` (text array)
      - `canonical_url` (text)
      - `og_image` (text, Open Graph image)
      - `og_title` (text)
      - `og_description` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `api_keys`
      - `id` (uuid, primary key)
      - `name` (text, descriptive name)
      - `key_hash` (text, hashed API key)
      - `permissions` (jsonb, array of allowed endpoints)
      - `is_active` (boolean)
      - `last_used_at` (timestamptz)
      - `created_by` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)

    - `chat_conversations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles, nullable for anonymous)
      - `session_id` (text, for tracking anonymous sessions)
      - `created_at` (timestamptz)

    - `chat_messages`
      - `id` (uuid, primary key)
      - `conversation_id` (uuid, foreign key to chat_conversations)
      - `role` (text, user/assistant/system)
      - `content` (text)
      - `created_at` (timestamptz)

    - `content_reports`
      - `id` (uuid, primary key)
      - `reporter_id` (uuid, foreign key to profiles, nullable)
      - `content_type` (text, blog_post/discussion/message/profile)
      - `content_id` (uuid)
      - `reason` (text)
      - `description` (text)
      - `status` (text, pending/reviewed/resolved)
      - `reviewed_by` (uuid, foreign key to profiles, nullable)
      - `reviewed_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

    - `analytics_events`
      - `id` (uuid, primary key)
      - `event_type` (text, page_view/blog_read/chat_interaction/etc)
      - `event_data` (jsonb, flexible data storage)
      - `user_id` (uuid, nullable)
      - `session_id` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated and API access
    - Super admins can manage all content
    - Authors can manage their own blog posts
    - Public can read published blog posts
    - API keys have restricted access based on permissions

  3. Indexes
    - Add indexes for performance on frequently queried columns
    - Full-text search index on blog posts
*/

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  excerpt text DEFAULT '',
  cover_image text,
  tags text[] DEFAULT '{}',
  author_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Page SEO Table
CREATE TABLE IF NOT EXISTS page_seo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path text UNIQUE NOT NULL,
  title text,
  meta_description text,
  keywords text[] DEFAULT '{}',
  canonical_url text,
  og_image text,
  og_title text,
  og_description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- API Keys Table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  key_hash text NOT NULL,
  permissions jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  last_used_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Chat Conversations Table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Content Reports Table
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  content_type text NOT NULL CHECK (content_type IN ('blog_post', 'discussion', 'message', 'profile', 'comment')),
  content_id uuid NOT NULL,
  reason text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  event_data jsonb DEFAULT '{}',
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING gin(tags);

CREATE INDEX IF NOT EXISTS idx_page_seo_path ON page_seo(page_path);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_session ON chat_conversations(session_id);

CREATE INDEX IF NOT EXISTS idx_content_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_content_reports_type ON content_reports(content_type, content_id);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at DESC);

-- Full-text search index for blog posts
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_posts

-- Public can read published blog posts
CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authors can view their own posts
CREATE POLICY "Authors can view own posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- Super admins can view all posts
CREATE POLICY "Super admins can view all posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Authors can insert their own posts
CREATE POLICY "Authors can create posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (author_id = auth.uid());

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Super admins can update any post
CREATE POLICY "Super admins can update any post"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Authors can delete their own posts
CREATE POLICY "Authors can delete own posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (author_id = auth.uid());

-- Super admins can delete any post
CREATE POLICY "Super admins can delete any post"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- RLS Policies for page_seo

-- Anyone can read SEO data
CREATE POLICY "Anyone can read SEO data"
  ON page_seo FOR SELECT
  USING (true);

-- Only super admins can manage SEO
CREATE POLICY "Super admins can manage SEO"
  ON page_seo FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- RLS Policies for api_keys

-- Only super admins can view API keys
CREATE POLICY "Super admins can view API keys"
  ON api_keys FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Only super admins can manage API keys
CREATE POLICY "Super admins can manage API keys"
  ON api_keys FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- RLS Policies for chat_conversations

-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Super admins can view all conversations
CREATE POLICY "Super admins can view all conversations"
  ON chat_conversations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Anyone can create conversations
CREATE POLICY "Anyone can create conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (true);

-- RLS Policies for chat_messages

-- Users can view messages from their conversations
CREATE POLICY "Users can view own conversation messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

-- Super admins can view all messages
CREATE POLICY "Super admins can view all messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Anyone can insert messages
CREATE POLICY "Anyone can create messages"
  ON chat_messages FOR INSERT
  WITH CHECK (true);

-- RLS Policies for content_reports

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- Super admins can view all reports
CREATE POLICY "Super admins can view all reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
  ON content_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Super admins can update reports
CREATE POLICY "Super admins can update reports"
  ON content_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- RLS Policies for analytics_events

-- Super admins can view analytics
CREATE POLICY "Super admins can view analytics"
  ON analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Anyone can insert analytics events
CREATE POLICY "Anyone can create analytics events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
    BEFORE UPDATE ON blog_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_page_seo_updated_at ON page_seo;
CREATE TRIGGER update_page_seo_updated_at
    BEFORE UPDATE ON page_seo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
