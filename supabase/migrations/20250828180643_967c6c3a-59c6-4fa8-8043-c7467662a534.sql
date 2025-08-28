-- Fix function search paths by updating existing functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

CREATE OR REPLACE FUNCTION public.check_verified_purchase(user_id_param UUID, variant_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_id_param 
      AND oi.variant_id = variant_id_param
      AND o.status IN ('paid', 'shipped', 'delivered')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';