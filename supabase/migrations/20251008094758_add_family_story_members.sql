/*
  # Add Family Story Members (Tags)

  1. New Tables
    - `family_story_members`
      - `id` (uuid, primary key)
      - `family_story_id` (uuid, foreign key to family_stories)
      - `profile_id` (uuid, foreign key to profiles)
      - `created_at` (timestamptz)
      - Unique constraint on (family_story_id, profile_id)
  
  2. Security
    - Enable RLS on family_story_members table
    - Users can view members of stories they created or are tagged in
    - Only story creators can add/remove members
*/

-- Create family_story_members table
CREATE TABLE IF NOT EXISTS family_story_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_story_id uuid REFERENCES family_stories(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_story_id, profile_id)
);

ALTER TABLE family_story_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of stories they created or are tagged in
CREATE POLICY "Users can view story members"
  ON family_story_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_stories 
      WHERE family_stories.id = family_story_id 
      AND family_stories.profile_id = auth.uid()
    )
    OR profile_id = auth.uid()
  );

-- Policy: Only story creators can add members
CREATE POLICY "Story creators can add members"
  ON family_story_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_stories 
      WHERE family_stories.id = family_story_id 
      AND family_stories.profile_id = auth.uid()
    )
  );

-- Policy: Only story creators can remove members
CREATE POLICY "Story creators can remove members"
  ON family_story_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM family_stories 
      WHERE family_stories.id = family_story_id 
      AND family_stories.profile_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_family_story_members_story_id ON family_story_members(family_story_id);
CREATE INDEX IF NOT EXISTS idx_family_story_members_profile_id ON family_story_members(profile_id);
