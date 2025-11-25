-- Add inspired_by_fragrance field to product_variants
ALTER TABLE product_variants 
ADD COLUMN inspired_by_fragrance TEXT;

COMMENT ON COLUMN product_variants.inspired_by_fragrance IS 'Original perfume/fragrance that this variant is inspired by';