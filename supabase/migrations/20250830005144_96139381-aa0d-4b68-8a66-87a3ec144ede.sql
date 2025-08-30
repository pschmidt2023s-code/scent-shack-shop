-- Allow admins to delete orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can delete orders" ON orders
FOR DELETE USING (is_admin(auth.uid()));

-- Update orders policy to show only completed orders in admin view
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT USING (is_admin(auth.uid()) AND order_number IS NOT NULL);