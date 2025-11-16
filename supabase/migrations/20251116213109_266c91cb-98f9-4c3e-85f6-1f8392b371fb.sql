-- Füge Cashback-Prozentsatz zu product_variants hinzu
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS cashback_percentage numeric DEFAULT 5.0 CHECK (cashback_percentage >= 0 AND cashback_percentage <= 100);

COMMENT ON COLUMN product_variants.cashback_percentage IS 'Cashback-Prozentsatz für dieses Produkt (0-100%)';

-- Füge Cashback-Prozentsatz zu products hinzu (als Standard für neue Varianten)
ALTER TABLE products
ADD COLUMN IF NOT EXISTS default_cashback_percentage numeric DEFAULT 5.0 CHECK (default_cashback_percentage >= 0 AND default_cashback_percentage <= 100);

COMMENT ON COLUMN products.default_cashback_percentage IS 'Standard Cashback-Prozentsatz für neue Varianten dieses Produkts';

-- Erstelle Index für bessere Performance bei Cashback-Abfragen
CREATE INDEX IF NOT EXISTS idx_product_variants_cashback ON product_variants(cashback_percentage);

-- Update bestehende Varianten mit Standard-Cashback von 5%
UPDATE product_variants 
SET cashback_percentage = 5.0 
WHERE cashback_percentage IS NULL;