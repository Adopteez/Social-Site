/*
  # Add Group Join Requests Table

  1. New Table
    - `group_join_requests`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `profile_id` (uuid, foreign key to profiles)
      - `member_number` (text, optional)
      - `status` (text: 'pending', 'approved', 'rejected')
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Users can view their own requests
    - Group admins can view and manage requests for their groups
    - Users can create requests

  3. Indexes
    - Index on group_id and status for quick lookups
    - Index on profile_id for user's own requests
*/

CREATE TABLE IF NOT EXISTS group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_number text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id, profile_id, status)
);

ALTER TABLE group_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests"
  ON group_join_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Group admins can view requests for their groups"
  ON group_join_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_join_requests.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE POLICY "Users can create join requests"
  ON group_join_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Group admins can update requests"
  ON group_join_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_join_requests.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_join_requests.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_group_join_requests_group_status 
  ON group_join_requests(group_id, status);

CREATE INDEX IF NOT EXISTS idx_group_join_requests_profile 
  ON group_join_requests(profile_id);