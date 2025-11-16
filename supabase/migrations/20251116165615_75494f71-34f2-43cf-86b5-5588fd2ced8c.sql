-- Drop and recreate products table with TEXT id
DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  size TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Drop and recreate product_variants table with TEXT ids
DROP TABLE IF EXISTS product_variants CASCADE;

CREATE TABLE product_variants (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  in_stock BOOLEAN DEFAULT true NOT NULL,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  preorder BOOLEAN DEFAULT false,
  release_date TIMESTAMP WITH TIME ZONE,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Anyone can view products" ON products FOR SELECT USING (true);
CREATE POLICY "Admins can insert products" ON products FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update products" ON products FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete products" ON products FOR DELETE USING (is_admin(auth.uid()));

-- Policies for product_variants
CREATE POLICY "Anyone can view product variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Admins can insert product variants" ON product_variants FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Admins can update product variants" ON product_variants FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Admins can delete product variants" ON product_variants FOR DELETE USING (is_admin(auth.uid()));