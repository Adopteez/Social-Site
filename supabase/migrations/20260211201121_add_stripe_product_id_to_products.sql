/*
  # Add Stripe Product ID to Products Table

  1. Changes
    - Add `stripe_product_id` column to products table
    - This stores the Stripe Product ID after syncing with Stripe
    - Allows linking between Supabase products and Stripe products

  2. Notes
    - Column is nullable initially as products need to be synced first
    - Will be populated by sync-stripe-products edge function
*/

-- Add stripe_product_id column
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'stripe_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN stripe_product_id text;
    CREATE INDEX IF NOT EXISTS idx_products_stripe_product_id ON products(stripe_product_id);
  END IF;
END $$;
