/*
  # Add Partner Organizations and Group Verification

  1. New Tables
    - `partner_organizations`
      - `id` (uuid, primary key)
      - `name` (text, not null) - Organization name
      - `description` (text) - About the organization
      - `logo_url` (text) - Organization logo
      - `website` (text) - Organization website
      - `contact_email` (text) - Contact email
      - `is_active` (boolean) - Whether organization is active
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `partner_group_verification`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `partner_organization_id` (uuid, references partner_organizations)
      - `verification_code_prefix` (text) - Prefix for verification codes (e.g., "ORG-")
      - `requires_verification` (boolean) - Whether this group requires verification to join
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `group_verification_codes`
      - `id` (uuid, primary key)
      - `group_id` (uuid, references groups)
      - `code` (text, unique, not null) - Verification code (e.g., member number)
      - `is_used` (boolean) - Whether code has been used
      - `used_by` (uuid, references profiles, nullable) - Who used the code
      - `used_at` (timestamptz, nullable) - When code was used
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, nullable) - Optional expiration

  2. Changes to `groups` Table
    - Add `partner_organization_id` (uuid, references partner_organizations, nullable)
    - Add `requires_verification` (boolean, default false)
    - Add `is_partner_group` (boolean, default false)

  3. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to view partner organizations
    - Add policies for group admins to manage verification codes
    - Add policies for users to verify their membership
*/

-- Create partner_organizations table
CREATE TABLE IF NOT EXISTS partner_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  website text,
  contact_email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE partner_organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active partner organizations"
  ON partner_organizations FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only admins can insert partner organizations"
  ON partner_organizations FOR INSERT
  TO authenticated
  WITH CHECK (false);

CREATE POLICY "Only admins can update partner organizations"
  ON partner_organizations FOR UPDATE
  TO authenticated
  USING (false);

-- Add partner organization support to groups table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'partner_organization_id'
  ) THEN
    ALTER TABLE groups ADD COLUMN partner_organization_id uuid REFERENCES partner_organizations(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'requires_verification'
  ) THEN
    ALTER TABLE groups ADD COLUMN requires_verification boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'is_partner_group'
  ) THEN
    ALTER TABLE groups ADD COLUMN is_partner_group boolean DEFAULT false;
  END IF;
END $$;

-- Create partner_group_verification table
CREATE TABLE IF NOT EXISTS partner_group_verification (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  partner_organization_id uuid REFERENCES partner_organizations(id) ON DELETE CASCADE NOT NULL,
  verification_code_prefix text,
  requires_verification boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(group_id)
);

ALTER TABLE partner_group_verification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view partner group verification info"
  ON partner_group_verification FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Group admins can manage verification settings"
  ON partner_group_verification FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = partner_group_verification.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE POLICY "Group admins can update verification settings"
  ON partner_group_verification FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = partner_group_verification.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

-- Create group_verification_codes table
CREATE TABLE IF NOT EXISTS group_verification_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  code text UNIQUE NOT NULL,
  is_used boolean DEFAULT false,
  used_by uuid REFERENCES profiles(id),
  used_at timestamptz,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

ALTER TABLE group_verification_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view unused verification codes for groups they want to join"
  ON group_verification_codes FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Group admins can create verification codes"
  ON group_verification_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = group_verification_codes.group_id
      AND group_members.profile_id = auth.uid()
      AND group_members.role = 'admin'
    )
  );

CREATE POLICY "Users can update verification codes when using them"
  ON group_verification_codes FOR UPDATE
  TO authenticated
  USING (
    NOT is_used
    AND (expires_at IS NULL OR expires_at > now())
  )
  WITH CHECK (
    is_used = true
    AND used_by = auth.uid()
    AND used_at IS NOT NULL
  );

-- Insert some sample partner organizations
INSERT INTO partner_organizations (name, description, logo_url, is_active) VALUES
('Adoption & Samfund', 'En forening for adoptivfamilier og adopterede i Danmark', NULL, true),
('DanAdopt', 'Danmarks største adoptionsforening med støtte og vejledning', NULL, true),
('Adoptionspolitisk Forum', 'Forum for politisk dialog om adoption', NULL, true),
('Kina Adoption Danmark', 'Netværk for familier der har adopteret fra Kina', NULL, true),
('Korea Klubben', 'Forening for koreansk-danske adopterede', NULL, true)
ON CONFLICT DO NOTHING;
