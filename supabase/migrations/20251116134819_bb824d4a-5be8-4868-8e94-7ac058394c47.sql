-- Drop existing function first
DROP FUNCTION IF EXISTS public.get_public_reviews(text);

-- Add missing fields to reviews table
ALTER TABLE public.reviews 
  ADD COLUMN IF NOT EXISTS content TEXT,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS perfume_id TEXT,
  ADD COLUMN IF NOT EXISTS variant_id TEXT;

-- Add missing fields to payback_earnings
ALTER TABLE public.payback_earnings
  ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS earned_at TIMESTAMPTZ DEFAULT now();

-- Add missing fields to payback_payouts
ALTER TABLE public.payback_payouts
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ DEFAULT now();

-- Rename contests table to contest_entries and add missing fields  
ALTER TABLE IF EXISTS public.contests RENAME TO contest_entries;

ALTER TABLE IF EXISTS public.contest_entries
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT,
  ADD COLUMN IF NOT EXISTS is_winner BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'Deutschland';

-- Add missing fields to coupons
ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS min_order_amount DECIMAL(10,2),
  ADD COLUMN IF NOT EXISTS current_uses INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;

-- Enable RLS on contest_entries if not enabled
ALTER TABLE IF EXISTS public.contest_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create contest entries" ON public.contest_entries;
DROP POLICY IF EXISTS "Anyone can view contest entries" ON public.contest_entries;

-- Add RLS policies for contest_entries
CREATE POLICY "Users can create contest entries" ON public.contest_entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view contest entries" ON public.contest_entries FOR SELECT USING (true);

-- Recreate review function with updated fields
CREATE OR REPLACE FUNCTION public.get_public_reviews(p_product_id TEXT)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  product_id TEXT,
  perfume_id TEXT,
  rating INTEGER,
  title TEXT,
  comment TEXT,
  content TEXT,
  is_verified_purchase BOOLEAN,
  helpful_count INTEGER,
  created_at TIMESTAMPTZ,
  user_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.user_id,
    r.product_id,
    r.perfume_id,
    r.rating,
    r.title,
    r.comment,
    r.content,
    r.is_verified_purchase,
    r.helpful_count,
    r.created_at,
    COALESCE(p.full_name, 'Anonymous') as user_name
  FROM public.reviews r
  LEFT JOIN public.profiles p ON r.user_id = p.user_id
  WHERE (r.product_id = p_product_id OR r.perfume_id = p_product_id) 
    AND r.status = 'approved'
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;