-- Create chat messages table for live chat support
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'bot')),
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
  user_info JSONB, -- Store name, email for anonymous users
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_chat_messages_session_id ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert their own messages
CREATE POLICY "Users can insert their own messages" 
ON public.chat_messages 
FOR INSERT 
TO anon, authenticated
WITH CHECK (
  CASE 
    WHEN auth.uid() IS NULL THEN sender_type = 'user'  -- Anonymous users can only send user messages
    ELSE user_id = auth.uid() OR sender_type = 'user'  -- Authenticated users can send user messages
  END
);

-- Allow users to view messages from their session
CREATE POLICY "Users can view messages from their session" 
ON public.chat_messages 
FOR SELECT 
TO anon, authenticated
USING (
  session_id IN (
    SELECT DISTINCT session_id 
    FROM public.chat_messages 
    WHERE (auth.uid() IS NULL OR user_id = auth.uid() OR user_id IS NULL)
  )
);

-- Allow admins to view and insert all messages (we'll create admin role management separately)
CREATE POLICY "Admins can manage all messages" 
ON public.chat_messages 
FOR ALL
TO authenticated
USING (
  -- For now, allow all authenticated users to be admins - this can be restricted later with proper role management
  true
)
WITH CHECK (
  true
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_chat_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_chat_messages_updated_at
BEFORE UPDATE ON public.chat_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_chat_messages_updated_at();

-- Create chat sessions table to track active sessions
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_info JSONB, -- Store name, email for anonymous users  
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending')),
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on chat sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Allow users to create and view their own sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.chat_sessions 
FOR ALL
TO anon, authenticated
USING (
  user_id = auth.uid() OR user_id IS NULL
)
WITH CHECK (
  user_id = auth.uid() OR user_id IS NULL
);

-- Allow admins to view all sessions
CREATE POLICY "Admins can view all sessions" 
ON public.chat_sessions 
FOR SELECT
TO authenticated
USING (true);

-- Create trigger for chat sessions timestamps
CREATE TRIGGER update_chat_sessions_updated_at
BEFORE UPDATE ON public.chat_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();