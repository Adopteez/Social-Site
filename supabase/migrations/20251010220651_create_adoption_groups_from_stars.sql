/*
  # Create Adoption Country Groups Based on Matrix Stars

  This migration creates adoption country groups ONLY where there are stars (*) in the matrix image.
  Each starred combination gets TWO groups: one for "Adopterede" and one for "Adoptivforældre".

  ## Matrix Analysis:
  - All adoption countries have World Wide groups (star in World Wide column)
  - Specific country combinations are marked with stars

  ## Total Groups Created:
  Based on the matrix, we create groups for each starred position × 2 types (Adopterede + Adoptivforældre)

  ## Security:
  - All groups use existing RLS policies
*/

-- Helper function to insert both group types for a country combination
CREATE OR REPLACE FUNCTION insert_adoption_groups(
  p_adoption_country TEXT,
  p_residence_country TEXT
) RETURNS VOID AS $$
BEGIN
  -- Insert Adopterede group
  INSERT INTO groups (name, description, group_type, adoption_country, residence_country, member_type, is_paid)
  VALUES (
    p_adoption_country || ' in ' || p_residence_country || ' - Adopterede',
    'Community for people adopted from ' || p_adoption_country || ' residing in ' || p_residence_country,
    'adoption_country',
    p_adoption_country,
    p_residence_country,
    'adopted',
    false
  );

  -- Insert Adoptivforældre group
  INSERT INTO groups (name, description, group_type, adoption_country, residence_country, member_type, is_paid)
  VALUES (
    p_adoption_country || ' in ' || p_residence_country || ' - Adoptivforældre',
    'Community for adoptive parents who adopted from ' || p_adoption_country || ' and reside in ' || p_residence_country,
    'adoption_country',
    p_adoption_country,
    p_residence_country,
    'adoptive_parents',
    false
  );
END;
$$ LANGUAGE plpgsql;

-- Create all groups based on the matrix
DO $$
BEGIN
  -- ALL countries get World Wide groups (first column has stars for all rows)
  PERFORM insert_adoption_groups('Colombia', 'World Wide');
  PERFORM insert_adoption_groups('Madagascar', 'World Wide');
  PERFORM insert_adoption_groups('South Africa', 'World Wide');
  PERFORM insert_adoption_groups('Philippines', 'World Wide');
  PERFORM insert_adoption_groups('India', 'World Wide');
  PERFORM insert_adoption_groups('South Korea', 'World Wide');
  PERFORM insert_adoption_groups('Taiwan', 'World Wide');
  PERFORM insert_adoption_groups('Kazakhstan', 'World Wide');
  PERFORM insert_adoption_groups('Hungary', 'World Wide');
  PERFORM insert_adoption_groups('Thailand', 'World Wide');
  PERFORM insert_adoption_groups('Peru', 'World Wide');
  PERFORM insert_adoption_groups('Burkina Faso', 'World Wide');
  PERFORM insert_adoption_groups('Bosnia Herzegovina', 'World Wide');
  PERFORM insert_adoption_groups('Morocco', 'World Wide');
  PERFORM insert_adoption_groups('Haiti', 'World Wide');
  PERFORM insert_adoption_groups('Romania', 'World Wide');
  PERFORM insert_adoption_groups('Kenya', 'World Wide');
  PERFORM insert_adoption_groups('Russia', 'World Wide');
  PERFORM insert_adoption_groups('Bulgaria', 'World Wide');
  PERFORM insert_adoption_groups('Ethiopia', 'World Wide');
  PERFORM insert_adoption_groups('Senegal', 'World Wide');
  PERFORM insert_adoption_groups('Togo', 'World Wide');
  PERFORM insert_adoption_groups('China', 'World Wide');
  PERFORM insert_adoption_groups('Vietnam', 'World Wide');
  PERFORM insert_adoption_groups('Ecuador', 'World Wide');
  PERFORM insert_adoption_groups('Uganda', 'World Wide');
  PERFORM insert_adoption_groups('Dominican Republic', 'World Wide');
  PERFORM insert_adoption_groups('Ghana', 'World Wide');

  -- Denmark: Colombia, Madagascar, South Africa, Philippines, South Korea, Taiwan, Thailand, Peru, Romania, Russia, Bulgaria, Ethiopia, China
  PERFORM insert_adoption_groups('Colombia', 'Denmark');
  PERFORM insert_adoption_groups('Madagascar', 'Denmark');
  PERFORM insert_adoption_groups('South Africa', 'Denmark');
  PERFORM insert_adoption_groups('Philippines', 'Denmark');
  PERFORM insert_adoption_groups('South Korea', 'Denmark');
  PERFORM insert_adoption_groups('Taiwan', 'Denmark');
  PERFORM insert_adoption_groups('Thailand', 'Denmark');
  PERFORM insert_adoption_groups('Peru', 'Denmark');
  PERFORM insert_adoption_groups('Romania', 'Denmark');
  PERFORM insert_adoption_groups('Russia', 'Denmark');
  PERFORM insert_adoption_groups('Bulgaria', 'Denmark');
  PERFORM insert_adoption_groups('Ethiopia', 'Denmark');
  PERFORM insert_adoption_groups('China', 'Denmark');

  -- Sweden: Colombia, South Africa, India, South Korea, Thailand, Romania, Ethiopia, China
  PERFORM insert_adoption_groups('Colombia', 'Sweden');
  PERFORM insert_adoption_groups('South Africa', 'Sweden');
  PERFORM insert_adoption_groups('India', 'Sweden');
  PERFORM insert_adoption_groups('South Korea', 'Sweden');
  PERFORM insert_adoption_groups('Thailand', 'Sweden');
  PERFORM insert_adoption_groups('Romania', 'Sweden');
  PERFORM insert_adoption_groups('Ethiopia', 'Sweden');
  PERFORM insert_adoption_groups('China', 'Sweden');

  -- Norway: Colombia, South Korea, Thailand, Ethiopia, China
  PERFORM insert_adoption_groups('Colombia', 'Norway');
  PERFORM insert_adoption_groups('South Korea', 'Norway');
  PERFORM insert_adoption_groups('Thailand', 'Norway');
  PERFORM insert_adoption_groups('Ethiopia', 'Norway');
  PERFORM insert_adoption_groups('China', 'Norway');

  -- UK: India
  PERFORM insert_adoption_groups('India', 'UK');

  -- Austria: Philippines, Morocco, Russia
  PERFORM insert_adoption_groups('Philippines', 'Austria');
  PERFORM insert_adoption_groups('Morocco', 'Austria');
  PERFORM insert_adoption_groups('Russia', 'Austria');

  -- Belgium: Morocco, Haiti, Russia
  PERFORM insert_adoption_groups('Morocco', 'Belgium');
  PERFORM insert_adoption_groups('Haiti', 'Belgium');
  PERFORM insert_adoption_groups('Russia', 'Belgium');

  -- Finland: Bulgaria
  PERFORM insert_adoption_groups('Bulgaria', 'Finland');

  -- Germany: Russia
  PERFORM insert_adoption_groups('Russia', 'Germany');

  -- Iceland: India, China
  PERFORM insert_adoption_groups('India', 'Iceland');
  PERFORM insert_adoption_groups('China', 'Iceland');

  -- Italy: Philippines, Peru, Burkina Faso, Russia
  PERFORM insert_adoption_groups('Philippines', 'Italy');
  PERFORM insert_adoption_groups('Peru', 'Italy');
  PERFORM insert_adoption_groups('Burkina Faso', 'Italy');
  PERFORM insert_adoption_groups('Russia', 'Italy');

  -- Luxembourg: Haiti
  PERFORM insert_adoption_groups('Haiti', 'Luxembourg');

  -- Holland: Colombia, China
  PERFORM insert_adoption_groups('Colombia', 'Holland');
  PERFORM insert_adoption_groups('China', 'Holland');

  -- Canada: Vietnam, China
  PERFORM insert_adoption_groups('Vietnam', 'Canada');
  PERFORM insert_adoption_groups('China', 'Canada');

  -- US: Colombia, Philippines, India, South Korea, Kazakhstan, Ethiopia, China, Uganda, Ghana, Russia
  PERFORM insert_adoption_groups('Colombia', 'US');
  PERFORM insert_adoption_groups('Philippines', 'US');
  PERFORM insert_adoption_groups('India', 'US');
  PERFORM insert_adoption_groups('South Korea', 'US');
  PERFORM insert_adoption_groups('Kazakhstan', 'US');
  PERFORM insert_adoption_groups('Ethiopia', 'US');
  PERFORM insert_adoption_groups('China', 'US');
  PERFORM insert_adoption_groups('Uganda', 'US');
  PERFORM insert_adoption_groups('Ghana', 'US');
  PERFORM insert_adoption_groups('Russia', 'US');

END $$;

-- Drop the helper function
DROP FUNCTION insert_adoption_groups(TEXT, TEXT);
