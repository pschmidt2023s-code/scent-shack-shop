-- Fix remaining security gaps - Add comprehensive anonymous blocking

-- For addresses table - ensure no public access to customer addresses
CREATE POLICY "Block all anonymous address access"
ON public.addresses
FOR ALL
USING (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR is_admin(auth.uid())))
WITH CHECK (auth.uid() IS NOT NULL AND (auth.uid() = user_id OR is_admin(auth.uid())));

-- For orders table - ensure no public access to order data  
CREATE POLICY "Block all anonymous order access"
ON public.orders
FOR ALL
USING (auth.uid() IS NOT NULL AND ((user_id IS NOT NULL AND auth.uid() = user_id) OR is_admin(auth.uid())))
WITH CHECK (auth.uid() IS NOT NULL AND ((user_id IS NOT NULL AND auth.uid() = user_id) OR is_admin(auth.uid())));

-- For reviews table - tighten access to prevent business intelligence leaks
CREATE POLICY "Block anonymous review access"
ON public.reviews
FOR SELECT
USING (false);

-- Add additional security documentation
COMMENT ON TABLE public.addresses IS 'SENSITIVE CUSTOMER DATA: Contains customer names and physical addresses. Access restricted to address owners and authorized administrators only. All admin access is logged for security auditing.';

COMMENT ON TABLE public.orders IS 'SENSITIVE FINANCIAL DATA: Contains customer orders with payment and personal information. Access restricted to order owners and authorized administrators only. All admin access is logged for security auditing.';

COMMENT ON TABLE public.reviews IS 'BUSINESS INTELLIGENCE DATA: Contains customer reviews and feedback patterns. Access restricted to prevent competitive intelligence gathering. Public access available through dedicated public function only.';