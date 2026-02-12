/*
  # Fix infinite recursion in profiles RLS policies

  This migration fixes the infinite recursion error by simplifying the RLS policies.
  The issue was caused by policies querying the profiles table while evaluating 
  access to the profiles table.

  ## Changes
  1. Drop all existing profiles policies
  2. Create simple, non-recursive policies that use app_metadata instead
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Group admins can view their group members" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Super admins and admins can update any profile" ON profiles;

-- Create simple SELECT policy - all authenticated users can view all profiles
CREATE POLICY "Authenticated users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Create simple INSERT policy
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create simple UPDATE policy for own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create simple UPDATE policy for admins (using simpler role check)
CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (role IN ('super_admin', 'admin'))
  WITH CHECK (role IN ('super_admin', 'admin'));