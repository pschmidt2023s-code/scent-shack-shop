-- Erstelle customer_tiers Tabelle für Kundenstufen (Standard, Premium, VIP, etc.)
CREATE TABLE IF NOT EXISTS customer_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name text NOT NULL UNIQUE,
  base_cashback_bonus numeric NOT NULL DEFAULT 0 CHECK (base_cashback_bonus >= 0 AND base_cashback_bonus <= 100),
  description text,
  min_lifetime_purchases numeric DEFAULT 0,
  priority integer NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE customer_tiers IS 'Definiert Kundenstufen mit unterschiedlichen Cashback-Boni';
COMMENT ON COLUMN customer_tiers.base_cashback_bonus IS 'Zusätzlicher Cashback-Bonus in % für diese Stufe';
COMMENT ON COLUMN customer_tiers.min_lifetime_purchases IS 'Mindest-Einkaufswert für diese Stufe';

-- Erstelle cashback_bonuses Tabelle für zusätzliche Boni (Newsletter, Geburtstag, etc.)
CREATE TABLE IF NOT EXISTS cashback_bonuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bonus_name text NOT NULL UNIQUE,
  bonus_type text NOT NULL, -- 'newsletter', 'birthday', 'first_order', 'referral', etc.
  bonus_percentage numeric NOT NULL CHECK (bonus_percentage >= 0 AND bonus_percentage <= 100),
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

COMMENT ON TABLE cashback_bonuses IS 'Definiert zusätzliche Cashback-Boni für bestimmte Kriterien';

-- Füge customer_tier_id zur profiles Tabelle hinzu
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS customer_tier_id uuid REFERENCES customer_tiers(id) ON DELETE SET NULL;

COMMENT ON COLUMN profiles.customer_tier_id IS 'Zugeordnete Kundenstufe des Benutzers';

-- Erstelle Index für Performance
CREATE INDEX IF NOT EXISTS idx_profiles_customer_tier ON profiles(customer_tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_tiers_active ON customer_tiers(is_active, priority);
CREATE INDEX IF NOT EXISTS idx_cashback_bonuses_active ON cashback_bonuses(is_active, bonus_type);

-- RLS Policies für customer_tiers
ALTER TABLE customer_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann aktive Tiers sehen"
  ON customer_tiers FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Nur Admins können Tiers verwalten"
  ON customer_tiers FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- RLS Policies für cashback_bonuses
ALTER TABLE cashback_bonuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jeder kann aktive Boni sehen"
  ON cashback_bonuses FOR SELECT
  USING (is_active = true OR is_admin(auth.uid()));

CREATE POLICY "Nur Admins können Boni verwalten"
  ON cashback_bonuses FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Füge Standard-Tiers hinzu
INSERT INTO customer_tiers (tier_name, base_cashback_bonus, description, min_lifetime_purchases, priority) VALUES
  ('Standard', 0, 'Standard-Kunde ohne zusätzliche Boni', 0, 1),
  ('Premium', 6.5, 'Premium-Kunde mit 6,5% zusätzlichem Cashback', 500, 2),
  ('VIP', 10, 'VIP-Kunde mit 10% zusätzlichem Cashback', 2000, 3)
ON CONFLICT (tier_name) DO NOTHING;

-- Füge Standard-Boni hinzu
INSERT INTO cashback_bonuses (bonus_name, bonus_type, bonus_percentage, description) VALUES
  ('Newsletter-Bonus', 'newsletter', 1.5, 'Zusätzliche 1,5% Cashback für Newsletter-Abonnenten'),
  ('Geburtstags-Bonus', 'birthday', 5.0, 'Extra 5% Cashback im Geburtsmonat'),
  ('Erste Bestellung', 'first_order', 10.0, 'Einmaliger 10% Bonus bei der ersten Bestellung')
ON CONFLICT (bonus_name) DO NOTHING;

-- Update-Trigger für customer_tiers
CREATE OR REPLACE FUNCTION update_customer_tiers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customer_tiers_updated_at
  BEFORE UPDATE ON customer_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_tiers_updated_at();

CREATE TRIGGER update_cashback_bonuses_updated_at
  BEFORE UPDATE ON cashback_bonuses
  FOR EACH ROW
  EXECUTE FUNCTION update_customer_tiers_updated_at();