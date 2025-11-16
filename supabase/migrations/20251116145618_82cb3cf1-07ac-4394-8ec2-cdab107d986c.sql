-- Create auto_reorder_subscriptions table
CREATE TABLE IF NOT EXISTS public.auto_reorder_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  frequency_days INTEGER NOT NULL DEFAULT 30,
  next_order_date DATE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bundle_products table
CREATE TABLE IF NOT EXISTS public.bundle_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  discount_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bundle_items table (junction table)
CREATE TABLE IF NOT EXISTS public.bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundle_products(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create product_views table for tracking
CREATE TABLE IF NOT EXISTS public.product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  session_id TEXT,
  ip_address INET
);

-- Create performance_metrics table
CREATE TABLE IF NOT EXISTS public.performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_url TEXT NOT NULL,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  user_agent TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.auto_reorder_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for auto_reorder_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.auto_reorder_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON public.auto_reorder_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON public.auto_reorder_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON public.auto_reorder_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for bundle_products
CREATE POLICY "Everyone can view active bundles"
  ON public.bundle_products FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

-- RLS Policies for bundle_items
CREATE POLICY "Everyone can view bundle items"
  ON public.bundle_items FOR SELECT
  USING (true);

-- RLS Policies for product_views
CREATE POLICY "Users can view their own views"
  ON public.product_views FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert product views"
  ON public.product_views FOR INSERT
  WITH CHECK (true);

-- RLS Policies for performance_metrics
CREATE POLICY "Admins can view all metrics"
  ON public.performance_metrics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "Anyone can insert metrics"
  ON public.performance_metrics FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_auto_reorder_user ON public.auto_reorder_subscriptions(user_id, is_active);
CREATE INDEX idx_auto_reorder_next_date ON public.auto_reorder_subscriptions(next_order_date, is_active);
CREATE INDEX idx_bundle_items_bundle ON public.bundle_items(bundle_id);
CREATE INDEX idx_product_views_user ON public.product_views(user_id, viewed_at);
CREATE INDEX idx_product_views_product ON public.product_views(product_id, viewed_at);
CREATE INDEX idx_performance_metrics_page ON public.performance_metrics(page_url, created_at);

-- Create trigger for updating auto_reorder updated_at
CREATE OR REPLACE FUNCTION update_auto_reorder_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trigger_update_auto_reorder_updated_at
  BEFORE UPDATE ON public.auto_reorder_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_auto_reorder_updated_at();