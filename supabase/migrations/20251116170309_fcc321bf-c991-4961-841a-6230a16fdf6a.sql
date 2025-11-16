-- Insert products
INSERT INTO products (id, name, brand, category, size, image) VALUES
  ('50ml-bottles', '50ML Flaschen', 'ALDENAIR', 'Herren', '50ml', '/lovable-uploads/6b3ca60c-7598-4385-8d87-42839dc00836.png'),
  ('proben', 'Proben', 'ALDENAIR', 'Damen', '2ml', '/lovable-uploads/a8f5f8f2-c551-4c79-a16a-ec6fa216cf67.png'),
  ('autoparfum', 'Autoparfüm', 'ALDENAIR', 'Unisex', '10ml', '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png'),
  ('3d-collection', '3D Collection', 'ALDENAIR', 'Limited Edition', '100ml', '/lovable-uploads/f39391b1-7ea2-4b3f-9f06-15ca980668cb.png')
ON CONFLICT (id) DO NOTHING;

-- Insert 50ML variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('399-bottle', '50ml-bottles', '399', 'ALDENAIR 399', 'Ein luxuriöser orientalischer Duft mit warmen Noten von Amber, Vanille und Sandelholz. Perfekt für besondere Anlässe und elegante Abende.', 69.99, true, 50, 4.8, 234),
  ('978-bottle', '50ml-bottles', '978', 'ALDENAIR 978', 'Süß-würziger Duft mit Vanille, Karamell und orientalischen Gewürzen. Ein unverwechselbarer Signature-Duft für Kenner.', 69.99, true, 50, 4.9, 312),
  ('999-bottle', '50ml-bottles', '999', 'ALDENAIR 999', 'Holzig-blumiger Duft mit zeitlosem Charakter. Zedernholz, Moschus und subtile Blütennoten vereinen sich zu einem unvergesslichen Erlebnis.', 69.99, true, 50, 4.7, 198),
  ('189-bottle', '50ml-bottles', '189', 'ALDENAIR 189', 'Süßer Gourmand-Duft mit Kaffee, Schokolade und Vanille. Intensiv, einzigartig und perfekt für kühle Tage.', 69.99, true, 50, 4.6, 156),
  ('527-bottle', '50ml-bottles', '527', 'ALDENAIR 527', 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte.', 69.99, true, 50, 4.9, 287),
  ('695-bottle', '50ml-bottles', '695', 'ALDENAIR 695', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere.', 69.99, true, 50, 4.7, 223)
ON CONFLICT (id) DO NOTHING;

-- Insert Proben variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('399-sample', 'proben', '399', 'ALDENAIR 399 Probe', 'Ein luxuriöser orientalischer Duft mit warmen Noten von Amber, Vanille und Sandelholz. Perfekt für besondere Anlässe und elegante Abende.', 6.95, true, 200, 4.8, 189),
  ('978-sample', 'proben', '978', 'ALDENAIR 978 Probe', 'Süß-würziger Duft mit Vanille, Karamell und orientalischen Gewürzen. Ein unverwechselbarer Signature-Duft für Kenner.', 6.95, true, 200, 4.9, 245),
  ('999-sample', 'proben', '999', 'ALDENAIR 999 Probe', 'Holzig-blumiger Duft mit zeitlosem Charakter. Zedernholz, Moschus und subtile Blütennoten vereinen sich zu einem unvergesslichen Erlebnis.', 6.95, true, 200, 4.7, 167),
  ('189-sample', 'proben', '189', 'ALDENAIR 189 Probe', 'Süßer Gourmand-Duft mit Kaffee, Schokolade und Vanille. Intensiv, einzigartig und perfekt für kühle Tage.', 6.95, true, 200, 4.6, 134),
  ('527-sample', 'proben', '527', 'ALDENAIR 527 Probe', 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte.', 6.95, true, 200, 4.9, 201),
  ('695-sample', 'proben', '695', 'ALDENAIR 695 Probe', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere.', 6.95, true, 200, 4.7, 189)
ON CONFLICT (id) DO NOTHING;

-- Insert Autoparfüm variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('auto-399', 'autoparfum', '399', 'ALDENAIR Autoparfüm 399', 'Luxuriöser orientalischer Duft für Ihr Auto. Langanhaltender Duft, der Ihr Fahrzeug in eine Oase der Eleganz verwandelt.', 14.99, true, 150, 4.6, 92),
  ('auto-978', 'autoparfum', '978', 'ALDENAIR Autoparfüm 978', 'Süß-würziger Duft für unterwegs. Perfekt für lange Fahrten und ein angenehmes Ambiente im Auto.', 14.99, true, 150, 4.7, 103),
  ('auto-999', 'autoparfum', '999', 'ALDENAIR Autoparfüm 999', 'Holzig-blumiger Autoduft mit zeitlosem Charakter. Verwandelt jede Fahrt in ein Dufterlebnis.', 14.99, true, 150, 4.5, 87),
  ('auto-189', 'autoparfum', '189', 'ALDENAIR Autoparfüm 189', 'Süßer Gourmand-Duft mit Kaffee-Noten für Ihr Auto. Ideal für Kaffeeliebhaber.', 14.99, true, 150, 4.6, 95)
ON CONFLICT (id) DO NOTHING;

-- Insert 3D Collection variant
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, preorder, rating, review_count) VALUES
  ('3d-001', '3d-collection', '001', 'ALDENAIR 3D 001', 'Premium 3D Duft-Erlebnis mit innovativer Technologie. 100ml für langanhaltenden Luxus.', 79.99, true, 50, false, 4.9, 78)
ON CONFLICT (id) DO NOTHING;