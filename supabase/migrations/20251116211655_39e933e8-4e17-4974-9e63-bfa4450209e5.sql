-- Korrigiere Preise für 50ml Flaschen (47.99€)
UPDATE product_variants 
SET price = 47.99 
WHERE product_id = '50ml-bottles';

-- Korrigiere Preise für Proben (6.99€)
UPDATE product_variants 
SET price = 6.99 
WHERE product_id = 'proben';

-- Korrigiere Preise für Autoparfüm (27.99€)
UPDATE product_variants 
SET price = 27.99 
WHERE product_id = 'autoparfum';