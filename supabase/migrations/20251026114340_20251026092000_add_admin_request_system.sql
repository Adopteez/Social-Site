/*
  # Admin Request System

  1. New Tables
    - `admin_requests`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `user_id` (uuid, references auth.users)
      - `status` (text) - 'pending', 'approved', 'rejected'
      - `created_at` (timestamptz)
      - `resolved_at` (timestamptz, nullable)

    - `admin_request_objections`
      - `id` (uuid, primary key)
      - `request_id` (uuid, references admin_requests)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Members can create admin requests for groups they belong to
    - Members can view requests in their groups
    - Members can create objections to requests in their groups
    - System ensures max 1 pending request per user per group

  3. Logic
    - When objections >= 2, request is automatically rejected
    - Only 1 pending request per user per group allowed
*/

-- Create admin_requests table
CREATE TABLE IF NOT EXISTS admin_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz,
  UNIQUE(group_id, user_id, status)
);

-- Create admin_request_objections table
CREATE TABLE IF NOT EXISTS admin_request_objections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES admin_requests(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(request_id, user_id)
);

-- Enable RLS
ALTER TABLE admin_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_request_objections ENABLE ROW LEVEL SECURITY;

-- Policies for admin_requests
CREATE POLICY "Members can view admin requests in their groups"
  ON admin_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = admin_requests.group_id
      AND group_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Members can create admin requests for their groups"
  ON admin_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = admin_requests.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role != 'admin'
    )
  );

CREATE POLICY "System can update admin requests"
  ON admin_requests
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for admin_request_objections
CREATE POLICY "Members can view objections in their groups"
  ON admin_request_objections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_requests
      JOIN group_members ON group_members.group_id = admin_requests.group_id
      WHERE admin_requests.id = admin_request_objections.request_id
      AND group_members.profile_id = auth.uid()
    )
  );

CREATE POLICY "Members can create objections in their groups"
  ON admin_request_objections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM admin_requests
      JOIN group_members ON group_members.group_id = admin_requests.group_id
      WHERE admin_requests.id = request_id
      AND group_members.profile_id = auth.uid()
      AND admin_requests.user_id != auth.uid()
    )
  );

-- Function to check and auto-reject requests with 2+ objections
CREATE OR REPLACE FUNCTION check_admin_request_objections()
RETURNS TRIGGER AS $$
DECLARE
  objection_count int;
BEGIN
  -- Count objections for this request
  SELECT COUNT(*) INTO objection_count
  FROM admin_request_objections
  WHERE request_id = NEW.request_id;

  -- If 2 or more objections, reject the request
  IF objection_count >= 2 THEN
    UPDATE admin_requests
    SET status = 'rejected',
        resolved_at = now()
    WHERE id = NEW.request_id
    AND status = 'pending';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-reject after objections
DROP TRIGGER IF EXISTS check_objections_trigger ON admin_request_objections;
CREATE TRIGGER check_objections_trigger
  AFTER INSERT ON admin_request_objections
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_request_objections();

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_admin_requests_group_status ON admin_requests(group_id, status);
CREATE INDEX IF NOT EXISTS idx_admin_request_objections_request ON admin_request_objections(request_id);
