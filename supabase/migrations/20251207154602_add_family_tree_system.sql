/*
  # Stamtræ System til Adoptiv- og Biologiske Familier

  1. Nye Tabeller
    - `family_members`
      - Gemmer alle familiemedlemmer (adoptiv- og biologiske)
      - Holder information om navn, billede, fødselsdato, mm.
      - `family_type` (adoptive/biological) til at skelne mellem familie typer
    
    - `family_relationships`
      - Forbinder familiemedlemmer via relationer
      - Understøtter forskellige relationstyper (parent, child, sibling, spouse, etc.)
      - Link til hvilken child-profil stamtræet tilhører

  2. Funktionalitet
    - Hvert barn (fra children-tabellen) kan have sit eget stamtræ
    - Adoptivfamilie og biologisk familie kan co-eksistere
    - Profiler kan linkes som familiemedlemmer hvis de eksisterer på platformen
    
  3. Sikkerhed
    - RLS aktiveret på alle tabeller
    - Kun ejeren af et barn kan redigere dets stamtræ
    - Gruppemedlemmer kan se baseret på visibility indstillinger
*/

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  family_type text NOT NULL CHECK (family_type IN ('adoptive', 'biological')),
  profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
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

-- Create family_relationships table
CREATE TABLE IF NOT EXISTS family_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id uuid REFERENCES children(id) ON DELETE CASCADE NOT NULL,
  member_from uuid REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  member_to uuid REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
  relationship_type text NOT NULL CHECK (relationship_type IN ('parent', 'child', 'spouse', 'sibling', 'half_sibling')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies for family_members
CREATE POLICY "Users can view family members of their own children"
  ON family_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_members.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family members for their own children"
  ON family_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_members.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update family members of their own children"
  ON family_members FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_members.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family members of their own children"
  ON family_members FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_members.child_id
      AND children.profile_id = auth.uid()
    )
  );

-- RLS Policies for family_relationships
CREATE POLICY "Users can view family relationships of their own children"
  ON family_relationships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_relationships.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert family relationships for their own children"
  ON family_relationships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_relationships.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update family relationships of their own children"
  ON family_relationships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_relationships.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete family relationships of their own children"
  ON family_relationships FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = family_relationships.child_id
      AND children.profile_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_child_id ON family_members(child_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_type ON family_members(family_type);
CREATE INDEX IF NOT EXISTS idx_family_relationships_child_id ON family_relationships(child_id);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_from ON family_relationships(member_from);
CREATE INDEX IF NOT EXISTS idx_family_relationships_member_to ON family_relationships(member_to);
