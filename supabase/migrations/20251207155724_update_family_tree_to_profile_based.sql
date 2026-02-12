/*
  # Opdater Stamtræ System til Profil-Baseret

  1. Ændringer
    - Ændre family_members fra child_id til profile_id
    - Ændre family_relationships fra child_id til profile_id
    - Tilføj include_in_tree felt til children tabel
    - Tilføj child_id reference til family_members for at linke biologiske forældre
    
  2. Funktionalitet
    - Ét stamtræ per profil/familie (ikke per barn)
    - Børn kan vælges til at blive inkluderet i stamtræet
    - Hvert barn kan have forskellige biologiske forældre
    - Alle børn fremstår som søskende i stamtræet
*/

-- Drop existing foreign key constraints and recreate tables with new structure
DROP TABLE IF EXISTS family_relationships CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;

-- Create updated family_members table (profile-based, not child-based)
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  child_id uuid REFERENCES children(id) ON DELETE CASCADE,
  family_type text NOT NULL CHECK (family_type IN ('adoptive', 'biological')),
  linked_profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  first_name text NOT NULL,
  last_name text,
  birth_date date,
  death_date date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  image_url text,
  notes text,
  is_alive boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create updated family_relationships table
CREATE TABLE IF NOT EXISTS family_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_from uuid REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  member_to uuid REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling', 'half_sibling')),
  created_at timestamptz DEFAULT now()
);

-- Add include_in_tree to children table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'include_in_tree'
  ) THEN
    ALTER TABLE children ADD COLUMN include_in_tree boolean DEFAULT false;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can view their own family members"
  ON family_members FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own family members"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own family members"
  ON family_members FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own family members"
  ON family_members FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- RLS Policies for family_relationships
CREATE POLICY "Users can view their own family relationships"
  ON family_relationships FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own family relationships"
  ON family_relationships FOR INSERT
  TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own family relationships"
  ON family_relationships FOR UPDATE
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Users can delete their own family relationships"
  ON family_relationships FOR DELETE
  TO authenticated
  USING (profile_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_profile_id ON family_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_family_members_child_id ON family_members(child_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_type ON family_members(family_type);
CREATE INDEX IF NOT EXISTS idx_family_relationships_profile_id ON family_relationships(profile_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_from ON family_relationships(member_from);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_to ON family_relationships(member_to);
CREATE INDEX IF NOT EXISTS idx_children_include_in_tree ON children(include_in_tree);
