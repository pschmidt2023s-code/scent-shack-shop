-- Re-insert 50ML Flaschen product
INSERT INTO products (id, name, brand, category, size, image) VALUES
  ('50ml-bottles', '50ML Flaschen', 'ALDENAIR', 'Herren', '50ml', '/lovable-uploads/6b3ca60c-7598-4385-8d87-42839dc00836.png')
ON CONFLICT (id) DO NOTHING;

-- Re-insert 50ML variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('399-bottle', '50ml-bottles', '399', 'ALDENAIR 399', 'Ein luxuriöser orientalischer Duft mit warmen Noten von Amber, Vanille und Sandelholz. Perfekt für besondere Anlässe und elegante Abende.', 69.99, true, 50, 4.8, 234),
  ('978-bottle', '50ml-bottles', '978', 'ALDENAIR 978', 'Süß-würziger Duft mit Vanille, Karamell und orientalischen Gewürzen. Ein unverwechselbarer Signature-Duft für Kenner.', 69.99, true, 50, 4.9, 312),
  ('999-bottle', '50ml-bottles', '999', 'ALDENAIR 999', 'Holzig-blumiger Duft mit zeitlosem Charakter. Zedernholz, Moschus und subtile Blütennoten vereinen sich zu einem unvergesslichen Erlebnis.', 69.99, true, 50, 4.7, 198),
  ('189-bottle', '50ml-bottles', '189', 'ALDENAIR 189', 'Süßer Gourmand-Duft mit Kaffee, Schokolade und Vanille. Intensiv, einzigartig und perfekt für kühle Tage.', 69.99, true, 50, 4.6, 156),
  ('527-bottle', '50ml-bottles', '527', 'ALDENAIR 527', 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte.', 69.99, true, 50, 4.9, 287),
  ('695-bottle', '50ml-bottles', '695', 'ALDENAIR 695', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere.', 69.99, true, 50, 4.7, 223)
ON CONFLICT (id) DO NOTHING;