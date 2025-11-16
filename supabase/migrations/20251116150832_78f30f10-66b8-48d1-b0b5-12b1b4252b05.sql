-- Create product_videos table
CREATE TABLE IF NOT EXISTS public.product_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  duration_seconds INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ai_recommendations_cache table
CREATE TABLE IF NOT EXISTS public.ai_recommendations_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID,
  recommendations JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

-- Enable RLS
ALTER TABLE public.product_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_recommendations_cache ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Everyone can view active videos"
  ON public.product_videos FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Admins can manage videos"
  ON public.product_videos FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view their own cached recommendations"
  ON public.ai_recommendations_cache FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert recommendations"
  ON public.ai_recommendations_cache FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_product_videos_product ON public.product_videos(product_id, is_active);
CREATE INDEX idx_ai_cache_user_product ON public.ai_recommendations_cache(user_id, product_id, expires_at);

-- Create function to clean expired AI cache
CREATE OR REPLACE FUNCTION clean_expired_ai_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ai_recommendations_cache
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;