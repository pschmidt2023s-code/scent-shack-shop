-- Update price fields to use NUMERIC for better decimal handling
ALTER TABLE public.orders ALTER COLUMN total_amount TYPE NUMERIC(10,2);

ALTER TABLE public.order_items ALTER COLUMN unit_price TYPE NUMERIC(10,2);
ALTER TABLE public.order_items ALTER COLUMN total_price TYPE NUMERIC(10,2);

-- Update coupon fields for consistency
ALTER TABLE public.coupons ALTER COLUMN discount_value TYPE NUMERIC(10,2);
ALTER TABLE public.coupons ALTER COLUMN min_order_amount TYPE NUMERIC(10,2);