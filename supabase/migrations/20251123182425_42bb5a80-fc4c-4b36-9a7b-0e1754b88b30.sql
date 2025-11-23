-- Enable RLS on bundle_products if not already enabled
ALTER TABLE bundle_products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundle_products;
DROP POLICY IF EXISTS "Everyone can view active bundles" ON bundle_products;

-- Allow admins to manage all bundles
CREATE POLICY "Admins can manage all bundles"
ON bundle_products
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Allow everyone to view active bundles
CREATE POLICY "Public can view active bundles"
ON bundle_products
FOR SELECT
TO public
USING (is_active = true);