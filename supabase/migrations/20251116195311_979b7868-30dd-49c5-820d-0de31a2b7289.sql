-- RLS Policy für Orders: Erlaubt authentifizierten Benutzern, ihre eigenen Bestellungen zu erstellen
CREATE POLICY "Users can insert their own orders" 
ON public.orders 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- RLS Policy für Orders: Benutzer können ihre eigenen Bestellungen sehen
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policy für order_items: Benutzer können Items zu ihren eigenen Bestellungen hinzufügen
CREATE POLICY "Users can insert items to their own orders" 
ON public.order_items 
FOR INSERT 
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE orders.id = order_items.order_id 
    AND orders.user_id = auth.uid()
  )
);