-- Add scent_notes field to product_variants table
ALTER TABLE product_variants ADD COLUMN scent_notes TEXT;

COMMENT ON COLUMN product_variants.scent_notes IS 'Describes what the fragrance smells like (e.g., "Bergamotte, Zedernholz, Oud")';