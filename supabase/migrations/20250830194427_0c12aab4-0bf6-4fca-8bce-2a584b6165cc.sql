-- Create payback system tables
CREATE TABLE public.payback_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID,
  amount NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 5.0,
  status TEXT NOT NULL DEFAULT 'pending',
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID
);

-- Enable RLS
ALTER TABLE public.payback_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payback earnings
CREATE POLICY "Users can view their own payback earnings" 
ON public.payback_earnings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payback earnings" 
ON public.payback_earnings 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update payback earnings" 
ON public.payback_earnings 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create payback payouts table
CREATE TABLE public.payback_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'requested',
  bank_details JSONB,
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.payback_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for payback payouts
CREATE POLICY "Users can view their own payback payouts" 
ON public.payback_payouts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create payback payout requests" 
ON public.payback_payouts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all payback payouts" 
ON public.payback_payouts 
FOR ALL 
USING (is_admin(auth.uid()));

-- Add payback_balance to profiles table if it doesn't exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payback_balance NUMERIC DEFAULT 0;