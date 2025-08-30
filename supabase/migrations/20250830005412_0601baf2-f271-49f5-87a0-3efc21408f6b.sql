-- Update orders policy to show only completed orders with order numbers in admin view
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders" ON orders
FOR SELECT USING (is_admin(auth.uid()) AND order_number IS NOT NULL);