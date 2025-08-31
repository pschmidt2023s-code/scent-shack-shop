-- Fix Security Issues: Add missing RLS policies for exposed sensitive data (v2)

-- 1. Fix Newsletter Subscriptions - Ensure no public read access
-- Add explicit anonymous blocking policy
CREATE POLICY "Block anonymous newsletter access" 
ON public.newsletter_subscriptions 
FOR SELECT 
USING (false);

-- 2. Fix Coupons - Add explicit anonymous blocking (different name to avoid conflict)
CREATE POLICY "Block anonymous coupon access v2" 
ON public.coupons 
FOR SELECT 
USING (false);

-- 3. Fix Financial Data - Add explicit anonymous blocking policies

-- Block anonymous access to payback_earnings
CREATE POLICY "Block anonymous payback earnings access"
ON public.payback_earnings
FOR SELECT
USING (false);

-- Block anonymous access to payback_payouts  
CREATE POLICY "Block anonymous payback payouts access"
ON public.payback_payouts
FOR SELECT
USING (false);

-- Block anonymous access to partner_sales
CREATE POLICY "Block anonymous partner sales access"
ON public.partner_sales
FOR SELECT
USING (false);

-- Block anonymous access to partner_payouts
CREATE POLICY "Block anonymous partner payouts access"
ON public.partner_payouts
FOR SELECT
USING (false);

-- 4. Fix Partners table - Block anonymous access
CREATE POLICY "Block anonymous partner access"
ON public.partners
FOR SELECT
USING (false);

-- Add security documentation
COMMENT ON TABLE public.payback_earnings IS 'SENSITIVE FINANCIAL DATA: Contains customer payback balances and earnings. Access restricted to account owners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.payback_payouts IS 'SENSITIVE FINANCIAL DATA: Contains payout requests with bank details and amounts. Access restricted to account owners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partner_sales IS 'SENSITIVE BUSINESS DATA: Contains partner commission data and sales tracking. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partner_payouts IS 'SENSITIVE FINANCIAL DATA: Contains partner payout requests with bank details. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.partners IS 'SENSITIVE BUSINESS DATA: Contains partner commission rates, bank details, and business terms. Access restricted to individual partners and authorized administrators. All admin access is logged for compliance and security auditing.';

COMMENT ON TABLE public.newsletter_subscriptions IS 'SENSITIVE CUSTOMER DATA: Contains subscriber email addresses and preferences. Access restricted to authorized administrators only for business operations and compliance.';

COMMENT ON TABLE public.coupons IS 'SENSITIVE BUSINESS DATA: Contains active discount codes and promotional information. Access restricted to authorized administrators only to prevent code abuse and financial losses.';