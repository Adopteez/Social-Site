/*
  # Add Adoption Country Group Structure
  
  ## Changes
  
  1. **Modify groups table**
    - Add `adoption_country` (text) - Country where child was adopted from
    - Add `residence_country` (text) - Country where family resides (null = worldwide)
    - Add `member_type` (text) - "adoptee" or "adoptive_parent"
    - Add `is_paid` (boolean) - Whether group requires payment
    - Add `price` (numeric) - Group membership price
    - Add `currency` (text) - Currency for price
    - Update `group_type` to better reflect structure
  
  2. **Group Structure**
    - Each adoption country has 4 types of groups:
      * Adoptee groups (local per residence country + worldwide)
      * Adoptive parent groups (local per residence country + worldwide)
    - Examples:
      * "Taiwan → Denmark (Adoptees)" - Local group for adoptees from Taiwan living in Denmark
      * "Taiwan → Worldwide (Adoptees)" - Worldwide group for all adoptees from Taiwan
      * "Taiwan → Denmark (Adoptive Parents)" - Local group for adoptive parents in Denmark
      * "Taiwan → Worldwide (Adoptive Parents)" - Worldwide group for all adoptive parents
  
  3. **Security**
    - RLS policies already in place from initial schema
    - Payment verification will be handled at application level
*/

-- Add new columns to groups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'adoption_country'
  ) THEN
    ALTER TABLE groups ADD COLUMN adoption_country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'residence_country'
  ) THEN
    ALTER TABLE groups ADD COLUMN residence_country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'member_type'
  ) THEN
    ALTER TABLE groups ADD COLUMN member_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'is_paid'
  ) THEN
    ALTER TABLE groups ADD COLUMN is_paid boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'price'
  ) THEN
    ALTER TABLE groups ADD COLUMN price numeric;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'groups' AND column_name = 'currency'
  ) THEN
    ALTER TABLE groups ADD COLUMN currency text DEFAULT 'DKK';
  END IF;
END $$;

-- Add index for better query performance on adoption country groups
CREATE INDEX IF NOT EXISTS idx_groups_adoption_country ON groups(adoption_country);
CREATE INDEX IF NOT EXISTS idx_groups_residence_country ON groups(residence_country);
CREATE INDEX IF NOT EXISTS idx_groups_member_type ON groups(member_type);

-- Update existing RLS policy to allow viewing all groups for browsing
DROP POLICY IF EXISTS "Users can view groups they are members of" ON groups;

CREATE POLICY "Users can view all groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);
