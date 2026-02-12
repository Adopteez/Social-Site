/*
  # Add Birth Information and Visibility Fields to Children
  
  1. Changes to `children` table
    - Add `birth_mother` (text) - birth mother's name
    - Add `birth_father` (text) - birth father's name
    - Add `birth_name` (text) - child's birth name
    - Add visibility fields for each field:
      - Format: `{field_name}_visibility` (text)
      - Values: 'hidden', 'group', 'public'
      - Default: 'hidden' for sensitive information
    
  2. New Columns
    - birth_mother, birth_father, birth_name
    - Visibility columns for: name, birth_date, current_city, birth_city, orphanage_name, 
      facebook_profile, birth_mother, birth_father, birth_name
    
  3. Security
    - Existing RLS policies will apply
    - Visibility will be handled at application level
*/

-- Add birth information fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_mother'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_mother text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_father'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_father text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_name'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_name text;
  END IF;
END $$;

-- Add visibility fields for all child fields
DO $$
BEGIN
  -- name_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'name_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN name_visibility text DEFAULT 'public' CHECK (name_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_date_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_date_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_date_visibility text DEFAULT 'group' CHECK (birth_date_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- current_city_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'current_city_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN current_city_visibility text DEFAULT 'public' CHECK (current_city_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_city_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_city_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_city_visibility text DEFAULT 'group' CHECK (birth_city_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- orphanage_name_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'orphanage_name_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN orphanage_name_visibility text DEFAULT 'hidden' CHECK (orphanage_name_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- facebook_profile_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'facebook_profile_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN facebook_profile_visibility text DEFAULT 'group' CHECK (facebook_profile_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_mother_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_mother_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_mother_visibility text DEFAULT 'hidden' CHECK (birth_mother_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_father_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_father_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_father_visibility text DEFAULT 'hidden' CHECK (birth_father_visibility IN ('hidden', 'group', 'public'));
  END IF;

  -- birth_name_visibility
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'children' AND column_name = 'birth_name_visibility'
  ) THEN
    ALTER TABLE children ADD COLUMN birth_name_visibility text DEFAULT 'hidden' CHECK (birth_name_visibility IN ('hidden', 'group', 'public'));
  END IF;
END $$;