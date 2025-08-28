-- Create returns table for return requests
CREATE TABLE public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;

-- Create policies for returns
CREATE POLICY "Users can view their own returns" 
ON public.returns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own returns" 
ON public.returns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all returns" 
ON public.returns 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update returns" 
ON public.returns 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_returns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_returns_updated_at
BEFORE UPDATE ON public.returns
FOR EACH ROW
EXECUTE FUNCTION public.update_returns_updated_at();