-- Create reviews table for customer reviews and ratings
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  perfume_id TEXT NOT NULL,
  variant_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT false,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_perfume_id ON public.reviews(perfume_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON public.reviews 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own reviews" 
ON public.reviews 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
ON public.reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
ON public.reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create review_votes table for helpful/not helpful votes
CREATE TABLE IF NOT EXISTS public.review_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_helpful BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(review_id, user_id)
);

-- Enable RLS for review_votes
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for review_votes
CREATE POLICY "Review votes are viewable by everyone"
ON public.review_votes
FOR SELECT
USING (true);

CREATE POLICY "Users can vote on reviews"
ON public.review_votes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their votes"
ON public.review_votes
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their votes"
ON public.review_votes
FOR DELETE
USING (auth.uid() = user_id);

-- Create newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  preferences JSONB DEFAULT '{"product_updates": true, "promotions": true, "tips": false}'::jsonb
);

-- Enable RLS for newsletter_subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for newsletter (public signup)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscriptions
FOR INSERT
WITH CHECK (true);

-- Only admins can view/manage subscriptions (will need admin role check later)
CREATE POLICY "Newsletter subscriptions are private"
ON public.newsletter_subscriptions
FOR SELECT
USING (false);

-- Create function to update helpful_count on reviews
CREATE OR REPLACE FUNCTION update_review_helpful_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_votes 
            WHERE review_id = NEW.review_id AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE public.reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_votes 
            WHERE review_id = NEW.review_id AND is_helpful = true
        )
        WHERE id = NEW.review_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.reviews 
        SET helpful_count = (
            SELECT COUNT(*) 
            FROM public.review_votes 
            WHERE review_id = OLD.review_id AND is_helpful = true
        )
        WHERE id = OLD.review_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update helpful_count
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for reviews updated_at
CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();