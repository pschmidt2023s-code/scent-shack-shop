-- Fix search_path for security functions
CREATE OR REPLACE FUNCTION add_loyalty_points(
  p_user_id UUID,
  p_points INTEGER
)
RETURNS void AS $$
BEGIN
  -- Update or insert loyalty points
  INSERT INTO public.loyalty_points (user_id, points, lifetime_points)
  VALUES (p_user_id, p_points, p_points)
  ON CONFLICT (user_id) 
  DO UPDATE SET
    points = public.loyalty_points.points + p_points,
    lifetime_points = public.loyalty_points.lifetime_points + p_points,
    updated_at = now();
    
  -- Update tier based on lifetime points
  UPDATE public.loyalty_points
  SET tier = CASE
    WHEN lifetime_points >= 5000 THEN 'platinum'
    WHEN lifetime_points >= 1500 THEN 'gold'
    WHEN lifetime_points >= 500 THEN 'silver'
    ELSE 'bronze'
  END
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION update_loyalty_points_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;