-- Create system_settings table for configurable parameters
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create loyalty_rules table for configurable loyalty point rules
CREATE TABLE IF NOT EXISTS public.loyalty_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(50) NOT NULL,
  points_earned INTEGER NOT NULL,
  conditions JSONB,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create bundle_analytics table for tracking bundle performance
CREATE TABLE IF NOT EXISTS public.bundle_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES public.bundle_products(id) ON DELETE CASCADE,
  views INTEGER NOT NULL DEFAULT 0,
  purchases INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Admin only
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can manage loyalty rules"
  ON public.loyalty_rules FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can view bundle analytics"
  ON public.bundle_analytics FOR SELECT
  USING (is_admin(auth.uid()));

CREATE POLICY "System can insert bundle analytics"
  ON public.bundle_analytics FOR INSERT
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_system_settings_category ON public.system_settings(category);
CREATE INDEX idx_loyalty_rules_active ON public.loyalty_rules(is_active, priority);
CREATE INDEX idx_bundle_analytics_bundle_date ON public.bundle_analytics(bundle_id, date);

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value, category, description) VALUES
('loyalty_purchase_rate', '{"points_per_euro": 5, "enabled": true}'::jsonb, 'loyalty', 'Points earned per euro spent'),
('loyalty_signup_bonus', '{"points": 100, "enabled": true}'::jsonb, 'loyalty', 'Bonus points for new user signup'),
('loyalty_review_bonus', '{"points": 50, "enabled": true}'::jsonb, 'loyalty', 'Bonus points for writing a review'),
('loyalty_referral_bonus', '{"points": 200, "enabled": true}'::jsonb, 'loyalty', 'Bonus points for successful referral'),
('auto_reorder_discount', '{"percentage": 5, "enabled": true}'::jsonb, 'auto_reorder', 'Discount percentage for auto-reorder subscriptions'),
('bundle_discount_tiers', '{"tier1": 10, "tier2": 15, "tier3": 20}'::jsonb, 'bundles', 'Discount tiers for bundles'),
('stock_notification_enabled', '{"enabled": true, "batch_size": 100}'::jsonb, 'inventory', 'Stock notification settings'),
('referral_commission_rate', '{"percentage": 10, "enabled": true}'::jsonb, 'referral', 'Default referral commission rate')
ON CONFLICT (setting_key) DO NOTHING;

-- Insert default loyalty rules
INSERT INTO public.loyalty_rules (rule_name, rule_type, points_earned, conditions, priority) VALUES
('Purchase Points', 'purchase', 5, '{"per_euro": true}'::jsonb, 1),
('Signup Bonus', 'signup', 100, '{}'::jsonb, 10),
('Review Bonus', 'review', 50, '{"verified_purchase": true}'::jsonb, 5),
('Birthday Bonus', 'birthday', 250, '{"annual": true}'::jsonb, 8),
('Social Share', 'social_share', 25, '{"per_share": true, "max_per_day": 3}'::jsonb, 3)
ON CONFLICT DO NOTHING;