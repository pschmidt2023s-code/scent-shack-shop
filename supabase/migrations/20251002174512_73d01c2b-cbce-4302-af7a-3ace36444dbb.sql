-- Create contest_entries table
CREATE TABLE public.contest_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  birth_date DATE NOT NULL,
  message TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_winner BOOLEAN DEFAULT false,
  winner_position INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contest_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert their own contest entries"
  ON public.contest_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own contest entries"
  ON public.contest_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all contest entries"
  ON public.contest_entries
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update contest entries"
  ON public.contest_entries
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete contest entries"
  ON public.contest_entries
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create storage bucket for contest images
INSERT INTO storage.buckets (id, name, public)
VALUES ('contest-images', 'contest-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for contest images
CREATE POLICY "Authenticated users can upload contest images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'contest-images');

CREATE POLICY "Contest images are publicly accessible"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'contest-images');

CREATE POLICY "Admins can delete contest images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'contest-images' AND is_admin(auth.uid()));

-- Create updated_at trigger
CREATE TRIGGER update_contest_entries_updated_at
  BEFORE UPDATE ON public.contest_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();