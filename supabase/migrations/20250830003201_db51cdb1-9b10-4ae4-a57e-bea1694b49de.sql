-- Create partner program database structure

-- Partner status enum
CREATE TYPE public.partner_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- Partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_code TEXT NOT NULL UNIQUE,
  status partner_status NOT NULL DEFAULT 'pending',
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 2.50, -- Commission in euros
  total_sales NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_commission NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_paid_out NUMERIC(10,2) NOT NULL DEFAULT 0,
  bank_details JSONB,
  application_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES auth.users(id)
);

-- Partner sales tracking
CREATE TABLE public.partner_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  commission_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner_id, order_id)
);

-- Partner payouts
CREATE TABLE public.partner_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested', -- requested, processing, completed, rejected
  bank_details JSONB NOT NULL,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  processed_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Add partner tracking to orders
ALTER TABLE public.orders ADD COLUMN partner_id UUID REFERENCES partners(id);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for partners
CREATE POLICY "Partners can view their own data" ON public.partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create partner applications" ON public.partners
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Partners can update their own data" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all partners" ON public.partners
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for partner sales
CREATE POLICY "Partners can view their own sales" ON public.partner_sales
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_sales.partner_id AND partners.user_id = auth.uid())
  );

CREATE POLICY "Admins can view all partner sales" ON public.partner_sales
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for partner payouts
CREATE POLICY "Partners can view their own payouts" ON public.partner_payouts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_payouts.partner_id AND partners.user_id = auth.uid())
  );

CREATE POLICY "Partners can create payout requests" ON public.partner_payouts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM partners WHERE partners.id = partner_payouts.partner_id AND partners.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all payouts" ON public.partner_payouts
  FOR ALL USING (is_admin(auth.uid()));

-- Triggers for updated_at
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON public.partners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate unique partner code
CREATE OR REPLACE FUNCTION public.generate_partner_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character code
    code := 'REF' || upper(substring(md5(random()::text) from 1 for 5));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM partners WHERE partner_code = code) INTO exists_check;
    
    -- If code doesn't exist, exit loop
    IF NOT exists_check THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$;