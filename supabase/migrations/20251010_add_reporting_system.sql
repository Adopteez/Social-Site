/*
  # Add Reporting System

  1. New Tables
    - `post_reports`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `reporter_id` (uuid, foreign key to auth.users) - User who reported
      - `reason` (text) - Reason for reporting
      - `status` (text) - pending, reviewed, dismissed, action_taken
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `resolved_by` (uuid, foreign key to auth.users)
      - `resolution_notes` (text)

    - `member_reports`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `reported_member_id` (uuid, foreign key to auth.users) - Member being reported
      - `reporter_id` (uuid, foreign key to auth.users) - User who reported
      - `reason` (text) - Reason for reporting
      - `status` (text) - pending, reviewed, dismissed, action_taken
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz)
      - `resolved_by` (uuid, foreign key to auth.users)
      - `resolution_notes` (text)

  2. Security
    - Enable RLS on both tables
    - Authenticated users can create reports
    - Users can view their own reports
    - Group admins can view reports in their groups

  3. Indexes
    - Index on post_id for fast lookup
    - Index on reported_member_id for fast lookup
    - Index on status for filtering
*/

-- Create post_reports table
CREATE TABLE IF NOT EXISTS post_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text
);

-- Create member_reports table
CREATE TABLE IF NOT EXISTS member_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  reported_member_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  resolution_notes text
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_post_reports_post_id ON post_reports(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reports_status ON post_reports(status);
CREATE INDEX IF NOT EXISTS idx_member_reports_reported_member_id ON member_reports(reported_member_id);
CREATE INDEX IF NOT EXISTS idx_member_reports_group_id ON member_reports(group_id);
CREATE INDEX IF NOT EXISTS idx_member_reports_status ON member_reports(status);

-- Enable RLS
ALTER TABLE post_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_reports ENABLE ROW LEVEL SECURITY;

-- Policies for post_reports

-- Users can create post reports
CREATE POLICY "Users can create post reports"
  ON post_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

-- Users can view their own reports
CREATE POLICY "Users can view own reports"
  ON post_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Group admins can view reports for posts in their groups
CREATE POLICY "Group admins can view post reports"
  ON post_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM posts
      JOIN group_members ON group_members.group_id = posts.group_id
      WHERE posts.id = post_reports.post_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Policies for member_reports

-- Users can create member reports
CREATE POLICY "Users can create member reports"
  ON member_reports
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reporter_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = member_reports.group_id
      AND group_members.profile_id = auth.uid()
    )
  );

-- Users can view their own reports
CREATE POLICY "Users can view own member reports"
  ON member_reports
  FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

-- Group admins can view all member reports in their groups
CREATE POLICY "Group admins can view member reports"
  ON member_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = member_reports.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );
