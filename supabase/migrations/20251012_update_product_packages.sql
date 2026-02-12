/*
  # Update Product Packages Structure

  ## Overview
  This migration updates the product structure to support four membership tiers:
  - Country Membership Basic (Local only)
  - Country Membership Plus (Local only, full features)
  - World Wide Membership Basic (Local + Worldwide)
  - World Wide Membership Plus (Local + Worldwide, full features)

  ## 1. Changes to Tables

    ### products
    - Add `package_type` (text) - 'country_basic', 'country_plus', 'worldwide_basic', 'worldwide_plus'
    - Add `includes_worldwide` (boolean) - Whether package includes worldwide groups
    - Add `features` (jsonb) - Array of feature descriptions
    - Update price structure to use yearly pricing in USD

    ### user_product_access
    - Add `package_type` (text) - Which package type was purchased
    - Add `includes_worldwide` (boolean) - For quick filtering

  ## 2. Important Notes
    - Basic packages provide read-only/limited social features
    - Plus packages provide full social features and content creation
    - Worldwide packages include both country-specific and worldwide groups
    - All prices are yearly subscriptions in USD
*/

-- Add new columns to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'package_type'
  ) THEN
    ALTER TABLE products ADD COLUMN package_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'includes_worldwide'
  ) THEN
    ALTER TABLE products ADD COLUMN includes_worldwide boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'features'
  ) THEN
    ALTER TABLE products ADD COLUMN features jsonb;
  END IF;
END $$;

-- Add new columns to user_product_access table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_product_access' AND column_name = 'package_type'
  ) THEN
    ALTER TABLE user_product_access ADD COLUMN package_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_product_access' AND column_name = 'includes_worldwide'
  ) THEN
    ALTER TABLE user_product_access ADD COLUMN includes_worldwide boolean DEFAULT false;
  END IF;
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_package_type ON products(package_type);
CREATE INDEX IF NOT EXISTS idx_products_includes_worldwide ON products(includes_worldwide);
CREATE INDEX IF NOT EXISTS idx_user_product_access_package_type ON user_product_access(package_type);
CREATE INDEX IF NOT EXISTS idx_user_product_access_includes_worldwide ON user_product_access(includes_worldwide);

-- Update function to check if user has access to adoption country and worldwide
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

-- Create function to check if user has worldwide access for a country
CREATE OR REPLACE FUNCTION user_has_worldwide_access(user_id uuid, country text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_product_access
    WHERE profile_id = user_id
    AND adoption_country = country
    AND includes_worldwide = true
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update groups RLS to check for both country and worldwide access
DROP POLICY IF EXISTS "Users can view groups they have access to" ON groups;

CREATE POLICY "Users can view groups they have access to"
  ON groups FOR SELECT
  TO authenticated
  USING (
    NOT requires_purchase OR
    (
      -- User has access to the adoption country
      user_has_country_access(auth.uid(), adoption_country) AND
      -- If it's a worldwide group, user must have worldwide access
      (residence_country IS NOT NULL OR user_has_worldwide_access(auth.uid(), adoption_country))
    ) OR
    -- Admins can see everything
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin', 'moderator')
    )
  );
