/*
  # Add Relationship Status to Family Relationships

  1. Changes
    - Add `relationship_status` column to `family_relationships` table
    - Supports: 'married', 'cohabiting', 'divorced'
    - Default value is 'married' for existing spouse relationships
  
  2. Details
    - Only applies to spouse relationships
    - Allows tracking of marital status over time
    - Enables visual representation in family tree
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'family_relationships' AND column_name = 'relationship_status'
  ) THEN
    ALTER TABLE family_relationships 
    ADD COLUMN relationship_status text 
    CHECK (relationship_status IN ('married', 'cohabiting', 'divorced'))
    DEFAULT 'married';
  END IF;
END $$;