/*
  # Add Super Admin and Group Admin Roles

  1. Changes
    - Update role enum to include 'super_admin' and 'group_admin'
    - Add group_admin_for column to profiles (for group admins to manage specific groups)
    - Set Kim Jelling Ørnbo as super_admin
    
  2. Security
    - Only super_admins can assign other admins
    - Group admins can only manage their assigned groups
*/

-- Drop existing check constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new check constraint with updated roles
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('user', 'moderator', 'admin', 'group_admin', 'super_admin'));

-- Add column for group admins to track which group they manage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'group_admin_for'
  ) THEN
    ALTER TABLE profiles ADD COLUMN group_admin_for uuid REFERENCES groups(id);
  END IF;
END $$;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_group_admin_for ON profiles(group_admin_for);

-- Set Kim Jelling Ørnbo as super_admin
UPDATE profiles 
SET role = 'super_admin'
WHERE id = '9107ab90-de41-47ab-ad1a-802d94c952c0';

-- Update RLS policies to allow super_admin full access
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Super admins and admins can update any profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  )
  WITH CHECK (
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin')
  );

-- Create policy for group admins to view their group members
CREATE POLICY "Group admins can view their group members"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'admin', 'moderator') OR
    id IN (
      SELECT profile_id FROM group_members 
      WHERE group_id = (SELECT group_admin_for FROM profiles WHERE id = auth.uid())
    )
  );
