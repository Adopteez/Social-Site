/*
  # Add Family Stories and Group Photos

  1. New Tables
    - `family_stories`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `group_id` (uuid, foreign key to groups)
      - `title` (text)
      - `content` (text)
      - `language` (text) - en, da, sv, no, etc.
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - Unique constraint on (profile_id, group_id, language)
    
    - `group_photos`
      - `id` (uuid, primary key)
      - `group_id` (uuid, foreign key to groups)
      - `profile_id` (uuid, foreign key to profiles)
      - `photo_url` (text)
      - `caption` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for group members to read content
    - Add policies for authenticated users to create content in their groups
    - Add policies for users to update/delete their own content
*/

-- Create family_stories table
CREATE TABLE IF NOT EXISTS family_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text NOT NULL,
  language text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, group_id, language)
);

ALTER TABLE family_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view family stories"
  ON family_stories FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own family stories"
  ON family_stories FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own family stories"
  ON family_stories FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can delete own family stories"
  ON family_stories FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create group_photos table
CREATE TABLE IF NOT EXISTS group_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  photo_url text NOT NULL,
  caption text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE group_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group members can view photos"
  ON group_photos FOR SELECT
  TO authenticated
  USING (
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Group members can upload photos"
  ON group_photos FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id = auth.uid() AND
    group_id IN (
      SELECT group_id FROM group_members WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own photos"
  ON group_photos FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_stories_group_id ON family_stories(group_id);
CREATE INDEX IF NOT EXISTS idx_family_stories_profile_id ON family_stories(profile_id);
CREATE INDEX IF NOT EXISTS idx_group_photos_group_id ON group_photos(group_id);
CREATE INDEX IF NOT EXISTS idx_group_photos_created_at ON group_photos(created_at DESC);
