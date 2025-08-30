-- Add helpful_count column to existing reviews table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'reviews' AND column_name = 'helpful_count') THEN
        ALTER TABLE public.reviews ADD COLUMN helpful_count INTEGER DEFAULT 0;
    END IF;
END $$;

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

-- Create RLS policies for review_votes (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'Review votes are viewable by everyone') THEN
        CREATE POLICY "Review votes are viewable by everyone"
        ON public.review_votes
        FOR SELECT
        USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'Users can vote on reviews') THEN
        CREATE POLICY "Users can vote on reviews"
        ON public.review_votes
        FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'Users can update their votes') THEN
        CREATE POLICY "Users can update their votes"
        ON public.review_votes
        FOR UPDATE
        USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'review_votes' AND policyname = 'Users can delete their votes') THEN
        CREATE POLICY "Users can delete their votes"
        ON public.review_votes
        FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
END $$;

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

-- Create RLS policies for newsletter (only if they don't exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Anyone can subscribe to newsletter') THEN
        CREATE POLICY "Anyone can subscribe to newsletter"
        ON public.newsletter_subscriptions
        FOR INSERT
        WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'newsletter_subscriptions' AND policyname = 'Newsletter subscriptions are private') THEN
        CREATE POLICY "Newsletter subscriptions are private"
        ON public.newsletter_subscriptions
        FOR SELECT
        USING (false);
    END IF;
END $$;

-- Create function to update helpful_count on reviews (only if it doesn't exist)
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

-- Create trigger to update helpful_count (drop if exists, then create)
DROP TRIGGER IF EXISTS update_review_helpful_count_trigger ON public.review_votes;
CREATE TRIGGER update_review_helpful_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.review_votes
    FOR EACH ROW EXECUTE FUNCTION update_review_helpful_count();