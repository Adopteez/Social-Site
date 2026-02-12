/*
  # Populate Database with Demo Groups

  1. Demo Data Created
    - Adoption country groups with beautiful banner images
    - Local community groups for different cities
    - Support groups for different age groups

  2. Notes
    - Uses realistic images from Pexels stock photos
    - Creates foundation for group-based social networking
    - Groups are ready for members to join
*/

-- Insert adoption country groups with beautiful banner images
INSERT INTO groups (name, description, group_type, adoption_country, banner_url, created_at) VALUES
('Sydkorea Adopterede', 'Fællesskab for alle adopteret fra Sydkorea. Del dine erfaringer, still spørgsmål og find støtte i vores varme fællesskab.', 'adoption_country', 'South Korea', 'https://images.pexels.com/photos/237211/pexels-photo-237211.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Colombia Adoptionsgruppen', 'Netværk for familier med colombiansk adoption. Kulturarrangementer, socialt samvær og gode råd fra erfarne familier.', 'adoption_country', 'Colombia', 'https://images.pexels.com/photos/1870298/pexels-photo-1870298.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Etiopien Forbindelsen', 'Gruppe for adopterede fra Etiopien og deres familier. Lær om kulturen, skab netværk og find din plads i fællesskabet.', 'adoption_country', 'Ethiopia', 'https://images.pexels.com/photos/5214398/pexels-photo-5214398.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Kina Adoptionsnetværk', 'Støtte og netværk for kinesisk adoption. Arrangementer, aktiviteter, familiestøtte og kulturuddannelse.', 'adoption_country', 'China', 'https://images.pexels.com/photos/3629537/pexels-photo-3629537.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Vietnam Familierne', 'Netværk for adoptivfamilier med børn fra Vietnam. Aktiviteter, kulturworkshops og erfaringsudveksling.', 'adoption_country', 'Vietnam', 'https://images.pexels.com/photos/1659438/pexels-photo-1659438.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Indien Adoption', 'Fællesskab for familier med adoption fra Indien. Kulturbegivenheder, familienetværk og støtte.', 'adoption_country', 'India', 'https://images.pexels.com/photos/2007401/pexels-photo-2007401.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '2 years'),
('Thailand Forbindelsen', 'Gruppe for thailandsk adoption. Et trygt rum til at dele historier og finde tilhørsforhold.', 'adoption_country', 'Thailand', 'https://images.pexels.com/photos/1007426/pexels-photo-1007426.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year'),
('Filippinerne Netværk', 'Fællesskab for filippinsk adoption. Kulturelle begivenheder og familienetværk.', 'adoption_country', 'Philippines', 'https://images.pexels.com/photos/2474689/pexels-photo-2474689.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year'),
('Rusland Adopterede', 'Gruppe for russisk adoption. Del erfaringer og skab forbindelser.', 'adoption_country', 'Russia', 'https://images.pexels.com/photos/1661932/pexels-photo-1661932.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year'),
('Guatemala Gruppen', 'Netværk for guatemalansk adoption. Kulturarrangementer og fællesskab.', 'adoption_country', 'Guatemala', 'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year')
ON CONFLICT DO NOTHING;

-- Insert local community groups
INSERT INTO groups (name, description, group_type, residence_country, banner_url, created_at) VALUES
('København Adoptivfamilier', 'Lokalt netværk for adoptivfamilier i København. Månedlige møder, aktiviteter for børn og voksne samt social støtte.', 'local', 'Denmark', 'https://images.pexels.com/photos/1796730/pexels-photo-1796730.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year'),
('Aarhus Adoption', 'Fællesskab for adopterede og adoptivfamilier i Aarhus-området. Hyggelige arrangementer og støttende netværk.', 'local', 'Denmark', 'https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year'),
('Unge Adopterede', 'Gruppe for unge adopterede mellem 15-25 år. Et trygt rum til at dele tanker og erfaringer med ligesindede.', 'worldwide', NULL, 'https://images.pexels.com/photos/1059078/pexels-photo-1059078.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '6 months'),
('Adoptivforældre Støttegruppe', 'Støttegruppe for adoptivforældre. Del udfordringer, fejr sejre og find råd fra erfarne forældre.', 'worldwide', NULL, 'https://images.pexels.com/photos/1648387/pexels-photo-1648387.jpeg?auto=compress&cs=tinysrgb&w=1200', NOW() - INTERVAL '1 year')
ON CONFLICT DO NOTHING;
