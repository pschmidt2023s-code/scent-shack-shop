-- Fix orders status constraint to include pending_payment
ALTER TABLE public.orders DROP CONSTRAINT orders_status_check;

-- Add updated constraint with pending_payment status
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
CHECK (status = ANY (ARRAY['pending'::text, 'pending_payment'::text, 'processing'::text, 'paid'::text, 'shipped'::text, 'delivered'::text, 'cancelled'::text]));

-- Update any existing orders with invalid status
UPDATE public.orders SET status = 'pending' WHERE status NOT IN ('pending', 'pending_payment', 'processing', 'paid', 'shipped', 'delivered', 'cancelled');