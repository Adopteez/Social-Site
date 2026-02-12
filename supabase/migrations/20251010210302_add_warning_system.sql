/*
  # Add Warning System for Group Admins

  1. New Tables
    - `member_warnings` - Track warnings given to members by group admins
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles) - Member receiving warning
      - `group_id` (uuid, references groups) - Group where warning was issued
      - `warned_by` (uuid, references profiles) - Admin who issued warning
      - `reason` (text) - Reason for warning
      - `description` (text) - Detailed description
      - `severity` (text) - low, medium, high
      - `created_at` (timestamptz)
    
    - `exclusion_recommendations` - Track recommendations for member exclusion
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles) - Member to be excluded
      - `group_id` (uuid, references groups) - Group recommending exclusion
      - `recommended_by` (uuid, references profiles) - Group admin making recommendation
      - `reason` (text)
      - `description` (text)
      - `warning_count` (integer) - Number of warnings member has
      - `status` (text) - pending, approved, rejected
      - `reviewed_by` (uuid, references profiles) - Super admin who reviewed
      - `reviewed_at` (timestamptz)
      - `created_at` (timestamptz)

  2. Security
    - Group admins can add warnings for their group members
    - Group admins can recommend exclusions
    - Only super admins can approve/reject exclusion recommendations
*/

-- Create member_warnings table
CREATE TABLE IF NOT EXISTS member_warnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  group_id uuid REFERENCES groups(id) NOT NULL,
  warned_by uuid REFERENCES profiles(id) NOT NULL,
  reason text NOT NULL,
  description text,
  severity text DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  created_at timestamptz DEFAULT now()
);

-- Create exclusion_recommendations table
CREATE TABLE IF NOT EXISTS exclusion_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) NOT NULL,
  group_id uuid REFERENCES groups(id) NOT NULL,
  recommended_by uuid REFERENCES profiles(id) NOT NULL,
  reason text NOT NULL,
  description text,
  warning_count integer DEFAULT 0,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE member_warnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE exclusion_recommendations ENABLE ROW LEVEL SECURITY;

-- Policies for member_warnings
CREATE POLICY "Users can view their own warnings"
  ON member_warnings
  FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Group admins can view warnings in their group"
  ON member_warnings
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'moderator') OR
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'group_admin' AND
      group_id = (SELECT group_admin_for FROM profiles WHERE id = auth.uid())
    )
  );

CREATE POLICY "Group admins can add warnings to their group members"
  ON member_warnings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin') OR
    (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'group_admin' AND
      group_id = (SELECT group_admin_for FROM profiles WHERE id = auth.uid()) AND
      warned_by = auth.uid()
    )
  );

-- Policies for exclusion_recommendations
CREATE POLICY "Admins can view all exclusion recommendations"
  ON exclusion_recommendations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'moderator')
  );

CREATE POLICY "Group admins can view their recommendations"
  ON exclusion_recommendations
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'group_admin' AND
    recommended_by = auth.uid()
  );

CREATE POLICY "Group admins can create exclusion recommendations"
  ON exclusion_recommendations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'group_admin' AND
    group_id = (SELECT group_admin_for FROM profiles WHERE id = auth.uid()) AND
    recommended_by = auth.uid()
  );

CREATE POLICY "Super admins can update exclusion recommendations"
  ON exclusion_recommendations
  FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_member_warnings_profile_id ON member_warnings(profile_id);
CREATE INDEX IF NOT EXISTS idx_member_warnings_group_id ON member_warnings(group_id);
CREATE INDEX IF NOT EXISTS idx_exclusion_recommendations_status ON exclusion_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_exclusion_recommendations_profile_id ON exclusion_recommendations(profile_id);
