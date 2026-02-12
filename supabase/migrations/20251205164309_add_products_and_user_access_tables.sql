/*
  # Tilføj Produkter og Brugeradgang Tabeller

  ## Nye Tabeller
  
  ### `products`
  - `id` (uuid, primær nøgle)
  - `code` (text, unik) - Produktkode (country_basic, country_plus, osv.)
  - `name` (text) - Produktnavn
  - `type` (text) - Type (country, worldwide)
  - `tier` (text) - Niveau (basic, plus)
  - `price_monthly` (numeric) - Månedlig pris
  - `price_yearly` (numeric) - Årlig pris
  - `currency` (text) - Valuta
  - `is_active` (boolean) - Er produktet aktivt
  - `description` (text) - Beskrivelse
  - `created_at` (timestamp)
  
  ### `user_product_access`
  - `id` (uuid, primær nøgle)
  - `profile_id` (uuid, foreign key til profiles)
  - `product_id` (uuid, foreign key til products)
  - `package_type` (text) - Package type for kompatibilitet
  - `is_active` (boolean) - Er adgang aktiv
  - `started_at` (timestamp) - Startdato
  - `expires_at` (timestamp, nullable) - Udløbsdato
  - `hubspot_subscription_id` (text) - HubSpot reference
  - `created_at` (timestamp)
  - `updated_at` (timestamp)
  
  ## Sikkerhed
  - Enable RLS på begge tabeller
  - Brugere kan læse egne product access
  - Admins kan administrere alt
  - Products er læsbare af alle autentificerede brugere
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('country', 'worldwide')),
  tier text NOT NULL CHECK (tier IN ('basic', 'plus')),
  price_monthly numeric NOT NULL DEFAULT 0,
  price_yearly numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'DKK',
  is_active boolean DEFAULT true,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Create user_product_access table
CREATE TABLE IF NOT EXISTS user_product_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  package_type text NOT NULL CHECK (package_type IN ('country_basic', 'country_plus', 'worldwide_basic', 'worldwide_plus')),
  is_active boolean DEFAULT true,
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  hubspot_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_product_access ENABLE ROW LEVEL SECURITY;

-- Products policies (alle autentificerede kan læse produkter)
CREATE POLICY "Authenticated users can view products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage products"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- User product access policies
CREATE POLICY "Users can view own product access"
  ON user_product_access FOR SELECT
  TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY "Admins can view all product access"
  ON user_product_access FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage product access"
  ON user_product_access FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Insert the four product packages
INSERT INTO products (code, name, type, tier, price_monthly, price_yearly, description) VALUES
  ('country_basic', 'Country Membership Basic', 'country', 'basic', 39, 328, 'Adgang til dit landespecifikke gruppe'),
  ('country_plus', 'Country Membership Plus', 'country', 'plus', 59, 496, 'Fuld adgang til dit landespecifikke gruppe'),
  ('worldwide_basic', 'World Wide Membership Basic', 'worldwide', 'basic', 49, 412, 'Adgang til både lokale og verdensomspændende grupper'),
  ('worldwide_plus', 'World Wide Membership Plus', 'worldwide', 'plus', 69, 580, 'Fuld adgang til alle funktioner og grupper')
ON CONFLICT (code) DO NOTHING;