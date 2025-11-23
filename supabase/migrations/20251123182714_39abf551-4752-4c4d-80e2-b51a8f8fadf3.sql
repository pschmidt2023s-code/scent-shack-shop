-- Insert missing Proben bundle if it doesn't exist
INSERT INTO bundle_products (name, description, total_price, discount_percentage, quantity_required, is_active)
VALUES ('Sparkit - 5x Proben', 'Stelle dir dein persönliches Testerset zusammen', 29.95, 14, 5, true)
ON CONFLICT (id) DO NOTHING;

-- Make sure we have the correct bundle names
UPDATE bundle_products 
SET name = 'Sparset 3x 50ml Flakons'
WHERE name = 'Sparset 3x 50ml Flakons' AND quantity_required = 3;

UPDATE bundle_products 
SET name = 'Sparset 5x 50ml Flakons'
WHERE name = 'Sparset 5x 50ml Flakons' AND quantity_required = 5;