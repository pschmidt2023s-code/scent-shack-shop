-- Create function to add loyalty points
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add unique constraint on user_id for loyalty_points if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'loyalty_points_user_id_key'
  ) THEN
    ALTER TABLE public.loyalty_points 
    ADD CONSTRAINT loyalty_points_user_id_key UNIQUE (user_id);
  END IF;
END $$;