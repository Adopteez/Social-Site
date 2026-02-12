/*
  # Add Profile Intro Fields and Privacy Controls
  
  1. New fields for `profiles` table
    - `education` (text) - user's education
    - `job` (text) - user's job/occupation
    - `relationship_status` (text) - 'single', 'in_relationship', 'married'
    - `birth_date` (date) - user's birth date
    - `linked_children` (jsonb) - array of child profile IDs that exist in the system
    
  2. Visibility fields for all profile data
    - Format: `{field_name}_visibility` (text)
    - Values: 'hidden', 'group', 'public'
    - Fields: full_name, bio, relation_to_adoption, education, job, 
      relationship_status, birth_date, linked_children
    
  3. Security
    - Existing RLS policies will apply
    - Visibility handled at application level
*/

-- Add new profile fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'education'
  ) THEN
    ALTER TABLE profiles ADD COLUMN education text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'job'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'relationship_status'
  ) THEN
    ALTER TABLE profiles ADD COLUMN relationship_status text CHECK (relationship_status IN ('single', 'in_relationship', 'married'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linked_children'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linked_children jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add visibility fields for all profile fields
DO $$
BEGIN
  -- full_name_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'full_name_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN full_name_visibility text DEFAULT 'public' CHECK (full_name_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- bio_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'bio_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN bio_visibility text DEFAULT 'public' CHECK (bio_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- relation_to_adoption_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'relation_to_adoption_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN relation_to_adoption_visibility text DEFAULT 'public' CHECK (relation_to_adoption_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- education_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'education_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN education_visibility text DEFAULT 'public' CHECK (education_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- job_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'job_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN job_visibility text DEFAULT 'public' CHECK (job_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- relationship_status_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'relationship_status_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN relationship_status_visibility text DEFAULT 'public' CHECK (relationship_status_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_date_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'birth_date_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN birth_date_visibility text DEFAULT 'group' CHECK (birth_date_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- linked_children_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'linked_children_visibility'
  ) THEN
    ALTER TABLE profiles ADD COLUMN linked_children_visibility text DEFAULT 'public' CHECK (linked_children_visibility IN ('hidden', 'group', 'public'));
  END IF;
END $$;