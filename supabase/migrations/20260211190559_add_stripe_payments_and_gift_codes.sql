/*
  # Stripe Betalinger og Gavekoder System
  
  ## Beskrivelse
  Tilføjer support for Stripe betalinger, gavekoder og tracking af transaktioner.
  
  ## 1. Nye Tabeller
  
  ### `gift_codes`
  - `id` (uuid, primær nøgle)
  - `code` (text, unik) - Gavekoden/rabatkoden
  - `type` (text) - Type: 'percentage', 'fixed_amount', 'free_access'
  - `discount_percentage` (numeric) - Procentvis rabat (fx 20 for 20%)
  - `discount_amount` (numeric) - Fast rabat beløb
  - `free_months` (integer) - Antal måneder gratis adgang
  - `product_code` (text) - Hvilket produkt koden giver gratis (kun for free_access)
  - `valid_from` (timestamp) - Gyldig fra dato
  - `valid_to` (timestamp) - Gyldig til dato
  - `usage_limit` (integer) - Max antal gange koden kan bruges
  - `used_count` (integer) - Antal gange brugt
  - `is_active` (boolean) - Er koden aktiv
  - `created_by` (uuid) - Admin der oprettede koden
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ### `payments`
  - `id` (uuid, primær nøgle)
  - `profile_id` (uuid, foreign key til profiles)
  - `product_id` (uuid, foreign key til products)
  - `stripe_payment_intent_id` (text, unik) - Stripe Payment Intent ID
  - `stripe_customer_id` (text) - Stripe Customer ID
  - `amount` (numeric) - Beløb betalt
  - `currency` (text) - Valuta
  - `status` (text) - Status: 'pending', 'completed', 'failed', 'refunded'
  - `payment_method` (text) - Betalingsmetode
  - `gift_code_id` (uuid, nullable) - Anvendt gavekode
  - `original_amount` (numeric) - Oprindeligt beløb før rabat
  - `discount_amount` (numeric) - Rabat beløb
  - `subscription_type` (text) - 'monthly' eller 'yearly'
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ### `gift_code_usage`
  - `id` (uuid, primær nøgle)
  - `gift_code_id` (uuid, foreign key til gift_codes)
  - `profile_id` (uuid, foreign key til profiles)
  - `payment_id` (uuid, foreign key til payments)
  - `used_at` (timestamp)
  
  ## 2. Sikkerhed
  - Enable RLS på alle tabeller
  - Kun admins kan oprette og administrere gavekoder
  - Brugere kan se egne betalinger
  - Admins kan se alle betalinger
  
  ## 3. Vigtige Noter
  - Gift codes kan være procent, fast beløb eller give gratis adgang
  - Stripe webhook vil opdatere payment status automatisk
  - Usage tracking sikrer koder ikke overbruges
*/

-- Create gift_codes table
CREATE TABLE IF NOT EXISTS gift_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('percentage', 'fixed_amount', 'free_access')),
  discount_percentage numeric DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount numeric DEFAULT 0 CHECK (discount_amount >= 0),
  free_months integer DEFAULT 0 CHECK (free_months >= 0),
  product_code text,
  valid_from timestamptz DEFAULT now(),
  valid_to timestamptz,
  usage_limit integer DEFAULT 1 CHECK (usage_limit > 0),
  used_count integer DEFAULT 0 CHECK (used_count >= 0),
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  stripe_payment_intent_id text UNIQUE,
  stripe_customer_id text,
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'DKK',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text,
  gift_code_id uuid REFERENCES gift_codes(id) ON DELETE SET NULL,
  original_amount numeric CHECK (original_amount >= 0),
  discount_amount numeric DEFAULT 0 CHECK (discount_amount >= 0),
  subscription_type text CHECK (subscription_type IN ('monthly', 'yearly')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create gift_code_usage table
CREATE TABLE IF NOT EXISTS gift_code_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_code_id uuid NOT NULL REFERENCES gift_codes(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  used_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gift_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_code_usage ENABLE ROW LEVEL SECURITY;

-- Gift codes policies
CREATE POLICY "Admins can view all gift codes"
  ON gift_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage gift codes"
  ON gift_codes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Payments policies
CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Gift code usage policies
CREATE POLICY "Users can view own gift code usage"
  ON gift_code_usage FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all gift code usage"
  ON gift_code_usage FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can insert gift code usage"
  ON gift_code_usage FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_gift_codes_code ON gift_codes(code);
CREATE INDEX IF NOT EXISTS idx_gift_codes_is_active ON gift_codes(is_active);
CREATE INDEX IF NOT EXISTS idx_payments_profile_id ON payments(profile_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gift_code_usage_gift_code_id ON gift_code_usage(gift_code_id);
CREATE INDEX IF NOT EXISTS idx_gift_code_usage_profile_id ON gift_code_usage(profile_id);

-- Function to update gift code used_count
CREATE OR REPLACE FUNCTION increment_gift_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE gift_codes 
  SET used_count = used_count + 1,
      updated_at = now()
  WHERE id = NEW.gift_code_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically increment gift code usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_increment_gift_code_usage'
  ) THEN
    CREATE TRIGGER trigger_increment_gift_code_usage
      AFTER INSERT ON gift_code_usage
      FOR EACH ROW
      EXECUTE FUNCTION increment_gift_code_usage();
  END IF;
END $$;