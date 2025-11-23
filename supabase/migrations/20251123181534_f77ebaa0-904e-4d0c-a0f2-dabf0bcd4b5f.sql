-- Insert 50ML Bottles product
INSERT INTO products (id, name, brand, category, size, image) 
VALUES (
  '50ml-bottles',
  'ALDENAIR Prestige Collection',
  'ALDENAIR',
  '50ML Bottles',
  '50ml',
  '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  image = EXCLUDED.image;

-- Insert 50ML Bottles variants
INSERT INTO product_variants (id, product_id, variant_number, name, description, price, in_stock, stock_quantity, rating, review_count) VALUES
  ('399', '50ml-bottles', '399', 'ALDENAIR 399', 'Luxuriöser orientalischer Duft mit holzigen Akzenten. Die edle Komposition aus Bergamotte und Zedernholz in der Herznote verschmilzt mit dem kostbaren Oud in der Basis zu einem unverwechselbaren, maskulinen Parfüm. Ideal für besondere Anlässe und den selbstbewussten Mann.', 49.99, true, 100, 4.8, 156),
  ('978', '50ml-bottles', '978', 'ALDENAIR 978', 'Verführerischer süß-würziger Duft mit orientalischen Noten. Lavendel, Bergamotte und Zitrone treffen auf exotischen Jasmin-Sambac und warmen Honig. Die Basis aus Tabak, Tonkabohne und Vanille verleiht diesem Unisex-Parfüm eine sinnliche Tiefe und lang anhaltende Eleganz.', 49.99, true, 100, 4.9, 203),
  ('999', '50ml-bottles', '999', 'ALDENAIR 999', 'Harmonische Verbindung von holzigen und blumigen Elementen. Weißer Moschus und edles Sandelholz in der Herznote ergänzen sich perfekt mit der frischen Apfel-Note und dem mystischen Oud in der Basis. Ein zeitloser Duft für jeden Tag.', 49.99, true, 100, 4.7, 178),
  ('189', '50ml-bottles', '189', 'ALDENAIR 189', 'Süßer Gourmand-Duft mit verlockenden Kaffee-Noten. Blumige Akzente und edle Rose in der Herznote werden von einer reichen Basis aus Harzen, Holznoten und aromatischem Kaffee getragen. Zimt und Himbeere verleihen diesem Parfüm eine unwiderstehliche Süße.', 49.99, true, 100, 4.6, 167),
  ('390', '50ml-bottles', '390', 'ALDENAIR 390', 'Cremig-holziger Duft mit süßen und rauchigen Facetten. Zimt und Vanille in der Herznote verschmelzen mit Safran und Rum zu einer warmen, einladenden Komposition. Die Basis aus Tabak und Sandelholz verleiht diesem Parfüm eine maskuline Tiefe.', 49.99, true, 100, 4.8, 145),
  ('275', '50ml-bottles', '275', 'ALDENAIR 275', 'Süß-fruchtiger Duft mit exotischen Nuancen. Fruchtige Noten und Kardamom treffen auf cremige Tonkabohne und tropische Ananas. Die erdige Basis aus Eichenmoss, Talkum und Vanille macht diesen Duft zu einem perfekten Begleiter für warme Tage.', 49.99, true, 100, 4.5, 134),
  ('527', '50ml-bottles', '527', 'ALDENAIR 527', 'Orientalischer süßer Luxusduft mit edlen Inhaltsstoffen. Rose und Oud treffen auf weiches Leder, kostbaren Safran und frische Bergamotte. Die süße Basis aus Tonkabohne, Rohrzucker und Amber wird von weißem Moschus und Eichenmoos abgerundet.', 49.99, true, 100, 4.9, 201),
  ('695', '50ml-bottles', '695', 'ALDENAIR 695', 'Aromatisch-fruchtiger Duft mit komplexer Komposition. Zitrusfrüchte wie Orange und Zitrone verschmelzen mit Minze und schwarzer Johannisbeere. Die holzige Basis aus Zedernholz und Vetiver wird von süßer Vanille und Amber abgerundet.', 49.99, true, 100, 4.7, 189)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  description = EXCLUDED.description,
  in_stock = EXCLUDED.in_stock;