-- Insert Testerkits product
INSERT INTO products (id, name, brand, category, size, image) 
VALUES (
  'testerkits',
  'ALDENAIR Testerkits Collection',
  'ALDENAIR',
  'Testerkits',
  '5ml',
  '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  image = EXCLUDED.image;

-- Insert Testerkits variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('399-sample', 'testerkits', '399', 'ALDENAIR 399 Testerkit', 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Die edle Komposition aus Bergamotte und Zedernholz in der Herznote verschmilzt mit dem kostbaren Oud in der Basis zu einem unverwechselbaren, maskulinen Parfüm. Perfekt zum Testen vor dem Kauf der Vollgröße.', 6.95, true, 200, 4.8, 156),
  ('978-sample', 'testerkits', '978', 'ALDENAIR 978 Testerkit', 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und Zitrone treffen auf exotischen Jasmin-Sambac und warmen Honig. Probieren Sie diesen sinnlichen Duft in der praktischen 5ml Größe.', 6.95, true, 200, 4.9, 203),
  ('999-sample', 'testerkits', '999', 'ALDENAIR 999 Testerkit', 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz in der Herznote ergänzen sich perfekt mit der frischen Apfel-Note und dem mystischen Oud in der Basis.', 6.95, true, 200, 4.7, 178),
  ('189-sample', 'testerkits', '189', 'ALDENAIR 189 Testerkit', 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose in der Herznote werden von einer reichen Basis aus Harzen, Holznoten und aromatischem Kaffee getragen.', 6.95, true, 200, 4.6, 167),
  ('390-sample', 'testerkits', '390', 'ALDENAIR 390 Testerkit', 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille in der Herznote verschmelzen mit Safran und Rum zu einer warmen, einladenden Komposition.', 6.95, true, 200, 4.8, 145),
  ('275-sample', 'testerkits', '275', 'ALDENAIR 275 Testerkit', 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom treffen auf cremige Tonkabohne und tropische Ananas. Perfekt für warme Tage.', 6.95, true, 200, 4.5, 134),
  ('527-sample', 'testerkits', '527', 'ALDENAIR 527 Testerkit', 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte.', 6.95, true, 200, 4.9, 201),
  ('695-sample', 'testerkits', '695', 'ALDENAIR 695 Testerkit', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere.', 6.95, true, 200, 4.7, 189)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock;

-- Insert Sparkits product
INSERT INTO products (id, name, brand, category, size, image) 
VALUES (
  'sparkits',
  'ALDENAIR Sparkits Collection',
  'ALDENAIR',
  'Sparkits',
  'Bundle',
  '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category;

-- Insert Sparkits variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, original_price, in_stock, stock_quantity, rating, review_count) VALUES
  ('sparkit-5-proben', 'sparkits', 'SPAR5', 'Sparkit - 5x Proben', 'Stelle dir dein persönliches Sparkit zusammen! Wähle 5 beliebige Proben (5ml) aus unserem gesamten Sortiment und spare dabei. Perfekt, um verschiedene Düfte zu testen und deinen Favoriten zu finden.', 29.95, 34.75, true, 100, 4.9, 87),
  ('sparkit-3x50ml', 'sparkits', 'SPAR3', 'Sparkit - 3x 50ml Flakons', 'Spare beim Kauf von 3 beliebigen 50ml Flakons! Wähle aus unserem kompletten Sortiment deine drei Lieblingsdüfte aus und profitiere von einem attraktiven Bundle-Preis.', 129.99, 149.97, true, 50, 4.8, 124),
  ('sparkit-5x50ml', 'sparkits', 'SPAR5F', 'Sparkit - 5x 50ml Flakons', 'Unser beliebtestes Sparkit! Wähle 5 beliebige 50ml Flakons aus unserem gesamten Sortiment und spare dabei maximal. Ideal für Duftliebhaber, die ihre Sammlung erweitern möchten.', 199.99, 249.95, true, 30, 5.0, 156)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  original_price = EXCLUDED.original_price,
  in_stock = EXCLUDED.in_stock;