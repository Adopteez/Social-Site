/*
  # Add Group Discussion Forum

  1. New Tables
    - `group_discussions`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text) - The discussion topic/title
      - `content` (text) - The initial post content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `discussion_replies`
      - `id` (uuid, primary key)
      - `discussion_id` (uuid, foreign key to group_discussions)
      - `user_id` (uuid, foreign key to auth.users)
      - `content` (text) - The reply content
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Group members can view discussions in their groups
    - Group members can create discussions in their groups
    - Group members can reply to discussions in their groups
    - Users can update/delete their own discussions and replies

  3. Indexes
    - Index on group_id for fast lookup
    - Index on discussion_id for replies
    - Index on created_at for sorting
*/

-- Create group_discussions table
CREATE TABLE IF NOT EXISTS group_discussions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create discussion_replies table
CREATE TABLE IF NOT EXISTS discussion_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  discussion_id uuid NOT NULL REFERENCES group_discussions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_group_discussions_group_id ON group_discussions(group_id);
CREATE INDEX IF NOT EXISTS idx_group_discussions_created_at ON group_discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_discussion_id ON discussion_replies(discussion_id);
CREATE INDEX IF NOT EXISTS idx_discussion_replies_created_at ON discussion_replies(created_at DESC);

-- Enable RLS
ALTER TABLE group_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;

-- Policies for group_discussions

-- Group members can view discussions in their groups
CREATE POLICY "Group members can view discussions"
  ON group_discussions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_discussions.group_id
      AND group_members.profile_id = auth.uid()
    )
  );

-- Group members can create discussions
CREATE POLICY "Group members can create discussions"
  ON group_discussions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_discussions.group_id
      AND group_members.profile_id = auth.uid()
    )
  );

-- Users can update their own discussions
CREATE POLICY "Users can update own discussions"
  ON group_discussions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own discussions
CREATE POLICY "Users can delete own discussions"
  ON group_discussions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for discussion_replies

-- Group members can view replies in their group discussions
CREATE POLICY "Group members can view replies"
  ON discussion_replies
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_discussions
      JOIN group_members ON group_members.group_id = group_discussions.group_id
      WHERE group_discussions.id = discussion_replies.discussion_id
      AND group_members.profile_id = auth.uid()
    )
  );

-- Group members can create replies
CREATE POLICY "Group members can create replies"
  ON discussion_replies
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_discussions
      JOIN group_members ON group_members.group_id = group_discussions.group_id
      WHERE group_discussions.id = discussion_replies.discussion_id
      AND group_members.profile_id = auth.uid()
    )
  );

-- Users can update their own replies
CREATE POLICY "Users can update own replies"
  ON discussion_replies
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own replies
CREATE POLICY "Users can delete own replies"
  ON discussion_replies
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
