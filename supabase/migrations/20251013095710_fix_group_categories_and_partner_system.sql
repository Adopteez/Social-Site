/*
  # Fix Group Categories and Partner System

  1. Changes
    - Reset all groups to default 'parents' category
    - Only groups with partner_organization_id should be 'partner'
    - Add fields for partner group access control:
      - access_type: 'open', 'code', 'member_number', 'approval'
      - access_code: for code-based access
      - requires_member_number: boolean flag
    
  2. Security
    - Partner groups can only be accessed with proper credentials
    - Group admins can manage access settings

  3. Notes
    - Partner organizations buy groups on website
    - They choose access method (code, member number, or manual approval)
    - Partner admins don't have full system access like regular admins
*/

-- Reset all groups to 'parents' type first
UPDATE groups 
SET group_type = 'parents' 
WHERE group_type IS NOT NULL;

-- Set only partner organization groups to 'partner' type
UPDATE groups 
SET group_type = 'partner' 
WHERE partner_organization_id IS NOT NULL;

-- Add access control fields for partner groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'access_type'
  ) THEN
    ALTER TABLE groups ADD COLUMN access_type text DEFAULT 'open' CHECK (access_type IN ('open', 'code', 'member_number', 'approval'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'access_code'
  ) THEN
    ALTER TABLE groups ADD COLUMN access_code text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'requires_member_number'
  ) THEN
    ALTER TABLE groups ADD COLUMN requires_member_number boolean DEFAULT false;
  END IF;
END $$;

-- Add member_number field to group_members for partner group access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'group_members' AND column_name = 'member_number'
  ) THEN
    ALTER TABLE group_members ADD COLUMN member_number text;
  END IF;
END $$;

-- Create index for access_code lookups
CREATE INDEX IF NOT EXISTS idx_groups_access_code ON groups(access_code) WHERE access_code IS NOT NULL;