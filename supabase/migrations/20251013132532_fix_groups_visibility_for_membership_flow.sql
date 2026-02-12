/*
  # Fix Groups Visibility for Membership Flow

  ## Overview
  This migration updates the RLS policy for groups to allow authenticated users
  to VIEW all groups, but only ACCESS group content if they have purchased.
  This enables the membership purchase flow where users can see groups and 
  choose to buy membership.

  ## Changes
  1. Update groups RLS policy to allow viewing all groups
  2. Access control should be handled at the group content level, not at the group list level

  ## Security Notes
  - Users can see all groups (needed for membership purchase flow)
  - Actual group content access is still controlled by membership
  - Admins maintain full access
*/

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view groups they have access to" ON groups;

-- Create new policy that allows viewing all groups
CREATE POLICY "Authenticated users can view all groups"
  ON groups FOR SELECT
  TO authenticated
  USING (true);

-- Note: Access to group CONTENT (discussions, posts, members) should be 
-- controlled by separate RLS policies on those tables that check for 
-- user_product_access or group_members status
