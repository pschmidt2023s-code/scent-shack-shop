-- Fix critical security issues in chat system RLS policies

-- First, drop existing problematic policies for chat_sessions
DROP POLICY IF EXISTS "Users can manage their own sessions" ON public.chat_sessions;
DROP POLICY IF EXISTS "Admins can view all sessions" ON public.chat_sessions;

-- Create secure chat_sessions policies
CREATE POLICY "Authenticated users can manage their own sessions" 
ON public.chat_sessions 
FOR ALL 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Admins can view all chat sessions" 
ON public.chat_sessions 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update chat sessions" 
ON public.chat_sessions 
FOR UPDATE 
USING (is_admin(auth.uid()));

-- Fix chat_messages policies
DROP POLICY IF EXISTS "Users can insert their own messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can view messages from their session" ON public.chat_messages;
DROP POLICY IF EXISTS "Admins can manage all messages" ON public.chat_messages;

-- Create secure chat_messages policies
CREATE POLICY "Authenticated users can insert messages to their sessions" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  (user_id = auth.uid() OR sender_type = 'support') AND
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);

CREATE POLICY "Users can view messages from their own sessions" 
ON public.chat_messages 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL AND 
  session_id IN (SELECT id FROM chat_sessions WHERE user_id = auth.uid())
);

CREATE POLICY "Admins can manage all chat messages" 
ON public.chat_messages 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Secure database functions with proper search_path
CREATE OR REPLACE FUNCTION public.update_returns_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_chat_messages_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_verified_purchase(user_id_param uuid, variant_id_param text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.orders o
    JOIN public.order_items oi ON o.id = oi.order_id
    WHERE o.user_id = user_id_param 
      AND oi.variant_id = variant_id_param
      AND o.status IN ('paid', 'shipped', 'delivered')
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.claim_guest_payback_earnings()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update guest earnings to associate with the newly registered user
  UPDATE public.payback_earnings 
  SET user_id = NEW.id, guest_email = null
  WHERE guest_email = NEW.email AND user_id IS NULL;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_public_reviews(p_perfume_id text, p_variant_id text)
 RETURNS TABLE(id uuid, rating integer, title text, content text, images text[], is_verified boolean, created_at timestamp with time zone, reviewer_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.rating,
    r.title,
    r.content,
    r.images,
    r.is_verified,
    r.created_at,
    CASE 
      WHEN r.is_verified THEN 'Verifizierter Kunde'
      ELSE 'Kunde'
    END as reviewer_name
  FROM public.reviews r
  WHERE r.perfume_id = p_perfume_id 
    AND r.variant_id = p_variant_id
  ORDER BY r.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_order_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  next_number INTEGER;
  order_number TEXT;
BEGIN
  next_number := nextval('order_number_seq');
  order_number := 'ADN' || next_number;
  RETURN order_number;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')
  );
  RETURN new;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_partner_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.update_review_helpful_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.assign_order_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.order_number IS NULL THEN
    NEW.order_number := generate_order_number();
  END IF;
  RETURN NEW;
END;
$function$;