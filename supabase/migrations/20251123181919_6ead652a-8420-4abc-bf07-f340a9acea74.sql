-- Add quantity_required field to bundle_products table
ALTER TABLE bundle_products 
ADD COLUMN IF NOT EXISTS quantity_required INTEGER NOT NULL DEFAULT 3;

COMMENT ON COLUMN bundle_products.quantity_required IS 'Number of items required to qualify for this bundle (e.g., 3 or 5)';

-- Insert default bundles for 3-piece and 5-piece sets
INSERT INTO bundle_products (name, description, total_price, discount_percentage, quantity_required, is_active)
VALUES 
  ('Sparset 3x 50ml Flakons', 'Wähle 3 beliebige 50ml Flakons und spare 15%', 85.00, 15, 3, true),
  ('Sparset 5x 50ml Flakons', 'Wähle 5 beliebige 50ml Flakons und spare 20%', 135.00, 20, 5, true)
ON CONFLICT DO NOTHING;