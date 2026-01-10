-- Seed products data (matching existing static products)
INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, is_featured, stock_quantity, benefits)
SELECT 
  'Regenerating Serum',
  'Ultra-concentrated Mucin',
  'Our signature serum harnesses the power of snail mucin to deeply hydrate and regenerate skin cells. Clinically proven to reduce fine lines by 32% in 4 weeks.',
  89.00,
  'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop',
  'Best Seller',
  id,
  true,
  100,
  ARRAY['Deep hydration', 'Reduces fine lines', 'Promotes cell regeneration']
FROM public.categories WHERE slug = 'serums';

INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, is_featured, stock_quantity, benefits)
SELECT 
  'Hydrating Cream',
  '24-hour Moisture Lock',
  'Luxurious cream that locks in moisture for a full 24 hours. Formulated with hyaluronic acid and ceramides for plump, dewy skin.',
  65.00,
  'https://images.unsplash.com/photo-1570194065650-d99fb4d38c8a?q=80&w=800&auto=format&fit=crop',
  NULL,
  id,
  true,
  150,
  ARRAY['24-hour hydration', 'Plumps skin', 'Strengthens skin barrier']
FROM public.categories WHERE slug = 'moisturizers';

INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, is_featured, stock_quantity, benefits)
SELECT 
  'UV Defense SPF 50',
  'Mineral Antioxidant',
  'Lightweight mineral sunscreen with powerful antioxidants. No white cast, reef-safe formula that protects and nourishes.',
  45.00,
  'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
  'New',
  id,
  true,
  200,
  ARRAY['Broad spectrum SPF 50', 'Antioxidant protection', 'No white cast']
FROM public.categories WHERE slug = 'sun-protection';

INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, stock_quantity, benefits)
SELECT 
  'Night Repair Oil',
  'Retinol Alternative',
  'Gentle yet effective night oil with bakuchiol, a natural retinol alternative. Wake up to visibly younger-looking skin.',
  105.00,
  'https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop',
  'Rare',
  id,
  50,
  ARRAY['Anti-aging', 'Natural ingredients', 'Gentle formula']
FROM public.categories WHERE slug = 'serums';

INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, stock_quantity, benefits)
SELECT 
  'Purifying Cleanser',
  'pH Balanced Foam',
  'Gentle foaming cleanser that removes impurities without stripping skin. pH balanced to maintain your skin''s natural barrier.',
  35.00,
  'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',
  NULL,
  id,
  180,
  ARRAY['Deep cleansing', 'pH balanced', 'Non-stripping']
FROM public.categories WHERE slug = 'cleansers';

INSERT INTO public.products (name, tagline, description, price, image_url, badge, category_id, stock_quantity, benefits)
SELECT 
  'Eye Lift Cream',
  'Peptide Complex',
  'Advanced eye cream with peptide complex targets crow''s feet, puffiness, and dark circles. Visible results in 2 weeks.',
  75.00,
  'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop',
  NULL,
  id,
  120,
  ARRAY['Reduces puffiness', 'Diminishes dark circles', 'Firms eye area']
FROM public.categories WHERE slug = 'eye-care';

-- Seed bundles
INSERT INTO public.bundles (name, tagline, description, price, compare_at_price, image_url, badge) VALUES
(
  'The Complete Ritual',
  'Cleanser, Serum, Cream',
  'Everything you need for a complete skincare routine. Includes our best-selling cleanser, serum, and moisturizer.',
  175.00,
  206.00,
  'https://images.unsplash.com/photo-1556228994-adbdb4d57ae0?q=80&w=800&auto=format&fit=crop',
  'Save 15%'
),
(
  'Hydration Kit',
  'Serum + Cream',
  'The ultimate hydration duo. Pair our regenerating serum with our 24-hour moisturizer for maximum hydration.',
  140.00,
  154.00,
  'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
  'Best Value'
),
(
  'Anti-Aging Duo',
  'Night Oil + Eye Cream',
  'Target the signs of aging with our powerful night repair oil and peptide-rich eye cream.',
  160.00,
  180.00,
  'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop',
  NULL
);

-- Create a welcome discount code
INSERT INTO public.discount_codes (code, description, discount_type, discount_value, min_order_amount, is_active) VALUES
('WELCOME15', 'Welcome discount - 15% off your first order', 'percentage', 15.00, 50.00, true),
('RITUAL20', 'Save 20% on The Complete Ritual bundle', 'percentage', 20.00, 150.00, true);