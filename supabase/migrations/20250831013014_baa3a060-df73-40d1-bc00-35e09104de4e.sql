-- Create RESTRICTIVE policies to explicitly block anonymous access to all sensitive tables
-- Restrictive policies act as additional security layers that must ALL be satisfied

-- Block anonymous access to profiles (restrictive policy)
CREATE POLICY "Restrict anonymous profile access"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to addresses (restrictive policy) 
CREATE POLICY "Restrict anonymous address access"
ON public.addresses
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to orders (restrictive policy)
CREATE POLICY "Restrict anonymous order access" 
ON public.orders
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to partners (restrictive policy)
CREATE POLICY "Restrict anonymous partner access"
ON public.partners
AS RESTRICTIVE  
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to coupons (restrictive policy)
CREATE POLICY "Restrict anonymous coupon access"
ON public.coupons
AS RESTRICTIVE
FOR ALL  
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to newsletter subscriptions (restrictive policy)
CREATE POLICY "Restrict anonymous newsletter access"
ON public.newsletter_subscriptions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Block anonymous access to all financial tables (restrictive policies)
CREATE POLICY "Restrict anonymous payback earnings access"
ON public.payback_earnings
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Restrict anonymous payback payouts access" 
ON public.payback_payouts
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Restrict anonymous partner sales access"
ON public.partner_sales
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "Restrict anonymous partner payouts access"
ON public.partner_payouts
AS RESTRICTIVE
FOR ALL
TO anon
USING (false)
WITH CHECK (false);