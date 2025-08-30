-- Create newsletters table for admin newsletter management
CREATE TABLE public.newsletters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_to_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE public.newsletters ENABLE ROW LEVEL SECURITY;

-- Create policies for newsletters (admin only)
CREATE POLICY "Admins can manage newsletters" 
ON public.newsletters 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletters_updated_at
BEFORE UPDATE ON public.newsletters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();