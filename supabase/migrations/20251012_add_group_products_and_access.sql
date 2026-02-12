/*
  # Add Group Products and Access Control

  ## Overview
  This migration adds product-based access control for groups. Users must purchase
  access to specific adoption country groups before they can view or join them.

  ## 1. New Tables

    ### products
    - `id` (uuid, primary key)
    - `name` (text, not null) - Product name
    - `description` (text) - Product description
    - `adoption_country` (text, not null) - Which adoption country this product grants access to
    - `price` (numeric, not null) - Price in DKK
    - `currency` (text, default 'DKK')
    - `is_active` (boolean, default true)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

    ### user_product_access
    - `id` (uuid, primary key)
    - `profile_id` (uuid, references profiles)
    - `product_id` (uuid, references products)
    - `adoption_country` (text, not null) - For quick filtering
    - `purchased_at` (timestamptz, default now())
    - `expires_at` (timestamptz, nullable) - For subscription-based access
    - `is_active` (boolean, default true)
    - Unique constraint on (profile_id, product_id)

  ## 2. Changes to Existing Tables

    ### groups
    - Add `requires_purchase` (boolean, default true) - Whether access requires purchase
    - Update logic to check user_product_access before allowing group access

  ## 3. Security
    - Enable RLS on all new tables
    - Users can view their own purchases
    - Only admins can create/modify products
    - Group access requires valid product purchase

  ## 4. Important Notes
    - All groups now require product purchase by default
    - Products are tied to adoption countries, not individual groups
    - One product purchase grants access to all groups for that adoption country
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  adoption_country text NOT NULL,
  price numeric NOT NULL,
  currency text DEFAULT 'DKK',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_product_access table
CREATE TABLE IF NOT EXISTS user_product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  adoption_country text NOT NULL,
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  UNIQUE(profile_id, product_id)
);

-- Add requires_purchase column to groups
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'groups' AND column_name = 'requires_purchase'
  ) THEN
    ALTER TABLE groups ADD COLUMN requires_purchase boolean DEFAULT true;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_adoption_country ON products(adoption_country);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_user_product_access_profile ON user_product_access(profile_id);
CREATE INDEX IF NOT EXISTS idx_user_product_access_country ON user_product_access(adoption_country);
CREATE INDEX IF NOT EXISTS idx_user_product_access_active ON user_product_access(is_active);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_product_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for products

CREATE POLICY "Anyone can view active products"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Only admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- RLS Policies for user_product_access

CREATE POLICY "Users can view their own access"
  ON user_product_access FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all access"
  ON user_product_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only system can insert access"
  ON user_product_access FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

CREATE POLICY "Only admins can update access"
  ON user_product_access FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Create function to check if user has access to adoption country
CREATE OR REPLACE FUNCTION user_has_country_access(user_id uuid, country text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_product_access
    WHERE profile_id = user_id
    AND adoption_country = country
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update groups RLS to check for product access
DROP POLICY IF EXISTS "Users can view all groups" ON groups;

CREATE POLICY "Users can view groups they have access to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    NOT requires_purchase OR
    user_has_country_access(auth.uid(), adoption_country) OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );
