-- ALDENAIR Database Backup
-- Generated: 2025-12-21
-- This file contains all products, variants, and orders for restoration

-- ==========================================
-- PRODUCTS
-- ==========================================

-- ALDENAIR 111
INSERT INTO products (id, name, brand, category, description, image, scent_notes, inspired_by, ai_description, seasons, occasions, top_notes, middle_notes, base_notes, ingredients, is_active)
VALUES (
  'f9f00d92-19f2-409e-925f-9853c849c5de',
  'ALDENAIR 111',
  'ALDENAIR',
  'Herren',
  'ALDENAIR 111 ist ein charismatisches Eau de Parfum, das mit frischen Zitrusfrüchten und einer warmen Gewürzkomposition begeistert. Die raffinierte Kombination aus Grapefruit, Muskat und Zimt umhüllt Sie mit einer Aura von Selbstbewusstsein und Eleganz, während sinnliche Noten von Patchouli, Lakritz und Ambra für ein unvergessliches Dufterlebnis sorgen.',
  '/attached_assets/_com.apple.Pasteboard.Wk3lq2_1766301814349.png',
  NULL,
  'Sauvage Elixir®',
  NULL,
  ARRAY['Frühling', 'Herbst', 'Winter'],
  ARRAY['Büro', 'Date', 'Abendveranstaltung'],
  ARRAY['Grapefruit', 'Muskat', 'Zimt'],
  ARRAY['Lavendel'],
  ARRAY['Patchouli', 'Lakritz', 'Ambra'],
  ARRAY['Alcohol', 'Parfum (Fragrance)', 'Aqua (Water)', 'Citronellol', 'Ethylhexyl Methoxycinnamate', 'Linalool', 'BHT', 'Butyl Methoxydibenzoylmethane', 'Butylene Glycol Dicaprylate/Dicaprate', 'Geraniol', 'Cinnamyl Alcohol', 'Farnesol', 'Limonene', 'Benzyl Alcohol', 'Benzyl Benzoate', 'Eugenol', 'Citral', 'Isoeugenol', 'Tocopherol'],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  inspired_by = EXCLUDED.inspired_by,
  seasons = EXCLUDED.seasons,
  occasions = EXCLUDED.occasions,
  top_notes = EXCLUDED.top_notes,
  middle_notes = EXCLUDED.middle_notes,
  base_notes = EXCLUDED.base_notes,
  ingredients = EXCLUDED.ingredients;

-- ALDENAIR 632
INSERT INTO products (id, name, brand, category, description, image, scent_notes, inspired_by, ai_description, seasons, occasions, top_notes, middle_notes, base_notes, ingredients, is_active)
VALUES (
  '051d6800-55de-4329-afd8-822bb51e9d22',
  'ALDENAIR 632',
  'ALDENAIR',
  'Herren',
  'Entdecken Sie mit ALDENAIR 632 ein olfaktorisches Meisterwerk, das Ihre Sinne auf eine außergewöhnliche Reise entführt. Die erfrischenden Noten von Bergamotte, Zitrone und Orange harmonieren perfekt mit den warmen Gewürzen von Ingwer und Zimt, während der tiefgründige Duft von schwarzem Tee und Weihrauch eine Aura von Mystik und Eleganz verströmt.',
  '/attached_assets/_com.apple.Pasteboard.YUkaks_1766301802626.png',
  NULL,
  'Imagination®',
  NULL,
  ARRAY['Sommer'],
  ARRAY['Alltag', 'Date', 'Abendveranstaltung', 'Sport'],
  ARRAY['Bergamotte', 'Zitrone', 'Orange'],
  ARRAY['Ingwer', 'Zimt'],
  ARRAY['Schwarzer Tee', 'Weihrauch'],
  ARRAY['Alcohol', 'Parfum (Fragrance)', 'Aqua (Water)', 'Citronellol', 'Ethylhexyl Methoxycinnamate', 'Linalool', 'BHT', 'Butyl Methoxydibenzoylmethane', 'Butylene Glycol Dicaprylate/Dicaprate', 'Geraniol', 'Cinnamyl Alcohol', 'Farnesol', 'Limonene', 'Benzyl Alcohol', 'Benzyl Benzoate', 'Eugenol', 'Citral', 'Isoeugenol', 'Tocopherol'],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  inspired_by = EXCLUDED.inspired_by,
  seasons = EXCLUDED.seasons,
  occasions = EXCLUDED.occasions,
  top_notes = EXCLUDED.top_notes,
  middle_notes = EXCLUDED.middle_notes,
  base_notes = EXCLUDED.base_notes,
  ingredients = EXCLUDED.ingredients;

-- ALDENAIR 888
INSERT INTO products (id, name, brand, category, description, image, scent_notes, inspired_by, ai_description, seasons, occasions, top_notes, middle_notes, base_notes, ingredients, is_active)
VALUES (
  '94bbff79-4268-4aa8-9692-bf19ef3333e4',
  'ALDENAIR 888',
  'ALDENAIR',
  'Herren',
  'ALDENAIR 888 verkörpert die faszinierende Synthese aus fruchtiger Fruchtigkeit und orientalischer Tiefe. Die verführerische Himbeere verbindet sich harmonisch mit dem warmen, luxuriösen Oud und dem geheimnisvollen Weihrauch, während die sinnliche Note von Benzoe dem Duft eine unvergleichliche Eleganz verleiht. Perfekt für den modernen Mann, der in jeder Situation einen bleibenden Eindruck hinterlassen möchte.',
  '/attached_assets/_com.apple.Pasteboard.Zm3YhU_1766301754404.png',
  NULL,
  'Ombre Nomade®',
  NULL,
  ARRAY['Herbst', 'Winter'],
  ARRAY['Abendveranstaltung', 'Date', 'Hochzeit'],
  ARRAY['Himbeere'],
  ARRAY['Benzoe'],
  ARRAY['Oud', 'Weihrauch'],
  ARRAY['Alcohol', 'Parfum (Fragrance)', 'Aqua (Water)', 'Citronellol', 'Ethylhexyl Methoxycinnamate', 'Linalool', 'BHT', 'Butyl Methoxydibenzoylmethane', 'Butylene Glycol Dicaprylate/Dicaprate', 'Geraniol', 'Cinnamyl Alcohol', 'Farnesol', 'Limonene', 'Benzyl Alcohol', 'Benzyl Benzoate', 'Eugenol', 'Citral', 'Isoeugenol', 'Tocopherol'],
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image = EXCLUDED.image,
  inspired_by = EXCLUDED.inspired_by,
  seasons = EXCLUDED.seasons,
  occasions = EXCLUDED.occasions,
  top_notes = EXCLUDED.top_notes,
  middle_notes = EXCLUDED.middle_notes,
  base_notes = EXCLUDED.base_notes,
  ingredients = EXCLUDED.ingredients;

-- ==========================================
-- PRODUCT VARIANTS (50ML and 5ML Probes)
-- ==========================================

-- ALDENAIR 111 - 50 ML
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  '5c125e5c-d1e2-4f1d-b871-19013a4d7a36',
  'f9f00d92-19f2-409e-925f-9853c849c5de',
  '50 ML',
  '50 ML',
  '59.99',
  '71.99',
  100,
  true,
  'ALD-111-50ML',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price;

-- ALDENAIR 111 - 5 ML Probe
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  '4e43039c-8dba-4faa-a09f-da5ccc4aedd2',
  'f9f00d92-19f2-409e-925f-9853c849c5de',
  '5 ML Probe',
  '5 ML',
  '9.99',
  '12.99',
  100,
  true,
  'ALD-111-5ML',
  '/attached_assets/generated_images/aldenair_111_5ml_sample_bottle.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image;

-- ALDENAIR 632 - 50 ML
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  'ba7be17d-ed09-46d2-82fb-26c8cd100dd6',
  '051d6800-55de-4329-afd8-822bb51e9d22',
  '50 ML',
  '50 ML',
  '59.99',
  '71.99',
  100,
  true,
  'ALD-632-50ML',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price;

-- ALDENAIR 632 - 5 ML Probe
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  '7813147f-d9c8-47dc-ae75-3f6ba65297b0',
  '051d6800-55de-4329-afd8-822bb51e9d22',
  '5 ML Probe',
  '5 ML',
  '9.99',
  '12.99',
  100,
  true,
  'ALD-632-5ML',
  '/attached_assets/generated_images/aldenair_632_5ml_sample_bottle.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image;

-- ALDENAIR 888 - 50 ML
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  '0864134d-991c-463a-b58f-3044d671ff65',
  '94bbff79-4268-4aa8-9692-bf19ef3333e4',
  '50 ML',
  '50 ML',
  '59.99',
  '71.99',
  100,
  true,
  'ALD-888-50ML',
  NULL
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price;

-- ALDENAIR 888 - 5 ML Probe
INSERT INTO product_variants (id, product_id, name, size, price, original_price, stock, is_active, sku, image)
VALUES (
  '58043a93-067c-4179-a833-84a62845385b',
  '94bbff79-4268-4aa8-9692-bf19ef3333e4',
  '5 ML Probe',
  '5 ML',
  '9.99',
  '12.99',
  100,
  true,
  'ALD-888-5ML',
  '/attached_assets/generated_images/aldenair_888_5ml_sample_bottle.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  image = EXCLUDED.image;

-- ==========================================
-- ADMIN USER (for reference)
-- ==========================================
-- Admin Login: admin@aldenair.de / Admin123!

-- ==========================================
-- HOW TO RESTORE
-- ==========================================
-- Run this SQL in the database console or use:
-- psql $DATABASE_URL < server/data-backup.sql
