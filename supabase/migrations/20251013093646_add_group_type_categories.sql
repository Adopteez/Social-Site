/*
  # Add Group Type Categories

  1. Changes
    - Add `group_type` column to groups table with three categories:
      - 'adopted' - Groups for adopted individuals
      - 'parents' - Groups for adoptive parents
      - 'partner' - Groups for partner organizations
    - Set default to 'parents' for existing groups
    - Add index for better query performance

  2. Notes
    - Existing groups will default to 'parents' type
    - Partner organizations will be marked as 'partner' type
*/

-- Add group_type column with enum values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'group_type'
  ) THEN
    ALTER TABLE groups ADD COLUMN group_type text DEFAULT 'parents' CHECK (group_type IN ('adopted', 'parents', 'partner'));
  END IF;
END $$;

-- Update partner organization groups to have 'partner' type
UPDATE groups 
SET group_type = 'partner' 
WHERE partner_organization_id IS NOT NULL;

-- Create index for group_type queries
CREATE INDEX IF NOT EXISTS idx_groups_group_type ON groups(group_type);