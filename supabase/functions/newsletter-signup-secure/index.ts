import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { 
  securityHeaders, 
  authRateLimiter, 
  getClientKey, 
  validateOrigin,
  createSecurityResponse,
  createRateLimitResponse,
  sanitizeForLog
} from "../../../src/lib/security-edge.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NewsletterRequest {
  email: string;
  preferences: {
    product_updates: boolean;
    promotions: boolean;
    tips: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  // Validate origin for CSRF protection
  const allowedOrigins = [
    'https://scent-shack-shop.lovable.app',
    'http://localhost:8080',
    'https://localhost:8080'
  ];
  
  if (!validateOrigin(req, allowedOrigins)) {
    return createSecurityResponse({ error: 'Invalid origin' }, 403);
  }

  // Rate limiting
  const clientKey = getClientKey(req);
  if (!authRateLimiter.isAllowed(clientKey)) {
    const remainingAttempts = authRateLimiter.getRemainingAttempts(clientKey);
    return createRateLimitResponse(remainingAttempts);
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return createSecurityResponse({ error: 'Service configuration error' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return createSecurityResponse({ error: 'Authentication required' }, 401);
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication error:', sanitizeForLog(authError));
      return createSecurityResponse({ error: 'Invalid authentication' }, 401);
    }

    // Parse and validate request body
    const { email, preferences }: NewsletterRequest = await req.json();

    // Enhanced input validation
    if (!email || typeof email !== 'string') {
      return createSecurityResponse({ error: 'Valid email is required' }, 400);
    }

    // Email format validation
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return createSecurityResponse({ error: 'Invalid email format' }, 400);
    }

    // Sanitize email
    const sanitizedEmail = email.trim().toLowerCase();

    // Validate preferences object
    if (!preferences || typeof preferences !== 'object') {
      return createSecurityResponse({ error: 'Valid preferences are required' }, 400);
    }

    // Check for existing subscription
    const { data: existing, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('id')
      .eq('email', sanitizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Database check error:', sanitizeForLog(checkError));
      return createSecurityResponse({ error: 'Database error' }, 500);
    }

    if (existing) {
      return createSecurityResponse({ error: 'Email already subscribed' }, 409);
    }

    // Insert newsletter subscription
    const { error: insertError } = await supabase
      .from('newsletter_subscriptions')
      .insert({
        email: sanitizedEmail,
        preferences: preferences,
        user_id: user.id
      });

    if (insertError) {
      console.error('Insert error:', sanitizeForLog(insertError));
      return createSecurityResponse({ error: 'Failed to create subscription' }, 500);
    }

    // Log security event
    console.log('Newsletter subscription created:', sanitizeForLog({
      userId: user.id,
      email: sanitizedEmail,
      timestamp: new Date().toISOString(),
      clientKey
    }));

    return createSecurityResponse({
      success: true,
      message: 'Newsletter subscription created successfully'
    });

  } catch (error) {
    console.error('Unexpected error:', sanitizeForLog(error));
    return createSecurityResponse({ error: 'Internal server error' }, 500);
  }
};

serve(handler);