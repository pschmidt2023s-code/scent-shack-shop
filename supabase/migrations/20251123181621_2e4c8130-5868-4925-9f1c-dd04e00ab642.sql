-- Insert Autoparfum product
INSERT INTO products (id, name, brand, category, size, image) 
VALUES (
  'autoparfum',
  'ALDENAIR Autoparfüm Collection',
  'ALDENAIR',
  'Autoparfüm',
  '50ml',
  '/lovable-uploads/a8f5f8f2-c551-4c79-a16a-ec6fa216cf67.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  image = EXCLUDED.image;

-- Insert Autoparfum variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('auto-399', 'autoparfum', '399', 'ALDENAIR Autoparfüm 399', 'Luxuriöser orientalischer Duft für Ihr Auto. Die edle Komposition aus Bergamotte und Zedernholz verschmilzt mit kostbarem Oud zu einem unverwechselbaren Fahrerlebnis.', 27.99, true, 150, 4.8, 89),
  ('auto-978', 'autoparfum', '978', 'ALDENAIR Autoparfüm 978', 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und warmer Honig für eine sinnliche Autofahrt.', 27.99, true, 150, 4.9, 76),
  ('auto-999', 'autoparfum', '999', 'ALDENAIR Autoparfüm 999', 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz für eine elegante Autofahrt.', 27.99, true, 150, 4.7, 82),
  ('auto-189', 'autoparfum', '189', 'ALDENAIR Autoparfüm 189', 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose für eine luxuriöse Autofahrt.', 27.99, true, 150, 4.6, 68),
  ('auto-390', 'autoparfum', '390', 'ALDENAIR Autoparfüm 390', 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille für eine warme, einladende Atmosphäre im Auto.', 27.99, true, 150, 4.8, 73),
  ('auto-275', 'autoparfum', '275', 'ALDENAIR Autoparfüm 275', 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom für eine erfrischende Autofahrt.', 27.99, true, 150, 4.5, 65),
  ('auto-527', 'autoparfum', '527', 'ALDENAIR Autoparfüm 527', 'Orientalischer süßer Luxusduft für unterwegs. Rose und Oud treffen auf weiches Leder und kostbaren Safran.', 27.99, true, 150, 4.9, 92),
  ('auto-695', 'autoparfum', '695', 'ALDENAIR Autoparfüm 695', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte und Minze für eine belebende Autofahrt.', 27.99, true, 150, 4.7, 78)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  in_stock = EXCLUDED.in_stock;

-- Insert THREED Collection product
INSERT INTO products (id, name, brand, category, size, image) 
VALUES (
  'threed-collection',
  'THREED X ALDENAIR THREED WRLD 2 COLLECTION',
  'THREED X ALDENAIR',
  'Special Edition',
  '50ml',
  '/lovable-uploads/a9ff5ec5-a969-4de6-9989-8e36f83f1b9b.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  image = EXCLUDED.image;

-- Insert THREED Collection variant
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, preorder, release_date, stock_quantity, rating, review_count) VALUES
  ('threed-wrld-2', 'threed-collection', 'WRLD2', 'THREED X ALDENAIR THREED WRLD 2 COLLECTION', 'THREED X ALDENAIR – The WRLD in a Scent\n\nZwei kreative Welten, eine Vision: THREED und ALDENAIR vereinen Musik und Parfümerie in einer limitierten Special Edition. Zum kommenden Album THREED WRLD 2, das am 09.10.2025 erscheint, haben wir einen exklusiven Duft entwickelt – intensiv, charakterstark, einzigartig.\n\nMit über 70 Beats und 72 Songs ist dieses Album ein kreatives Meisterwerk – begleitet von einem Parfüm, das seine Tiefe spiegelt. Jede Vorbestellung enthält eine physische Albumkopie und den Signature-Duft – gefertigt aus den besten Rohstoffen Frankreichs und Deutschlands.\n\nJetzt vorbestellen – werde Teil dieser einmaligen Experience.', 39.99, false, true, '2025-10-09', 100, 5.0, 0)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  preorder = EXCLUDED.preorder,
  release_date = EXCLUDED.release_date;