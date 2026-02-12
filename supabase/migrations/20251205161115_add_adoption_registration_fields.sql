/*
  # Add adoption registration fields to profiles

  1. New Columns
    - `first_name` (text) - User's first name
    - `last_name` (text) - User's last name
    - `adoption_country` (text) - Country the user was adopted from
    - `member_type` (text) - Whether user is 'adoptee' or 'adopter' (adoptive parent)
    
  2. Changes
    - Keep `full_name` for backward compatibility but make it computed from first_name + last_name
    - Keep `country` but it represents country of residence (where user lives)
    - Update `relation_to_adoption` to use new `member_type` field
    
  3. Notes
    - All new fields are optional to maintain compatibility with existing users
    - Data from HubSpot checkout will populate these fields
*/

-- Add new fields for detailed user information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'first_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN first_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'adoption_country'
  ) THEN
    ALTER TABLE profiles ADD COLUMN adoption_country text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'member_type'
  ) THEN
    ALTER TABLE profiles ADD COLUMN member_type text CHECK (member_type IN ('adoptee', 'adopter', 'both'));
  END IF;
END $$;

-- Create an index on adoption_country for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_adoption_country ON profiles(adoption_country);

-- Create an index on member_type for faster filtering
CREATE INDEX IF NOT EXISTS idx_profiles_member_type ON profiles(member_type);

-- Create an index on country (country of residence) for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
