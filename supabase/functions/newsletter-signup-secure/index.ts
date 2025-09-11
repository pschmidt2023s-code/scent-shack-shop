import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

// Enhanced CORS headers with security
const securityHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Content-Security-Policy': "default-src 'self'",
};

// Rate limiting for edge functions using in-memory store
class EdgeRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number = 10,
    private windowMs: number = 15 * 60 * 1000 // 15 minutes
  ) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or first attempt
      this.attempts.set(key, { count: 1, resetTime: now + this.windowMs });
      return true;
    }

    if (record.count >= this.maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  getRemainingAttempts(key: string): number {
    const record = this.attempts.get(key);
    if (!record || Date.now() > record.resetTime) {
      return this.maxAttempts;
    }
    return Math.max(0, this.maxAttempts - record.count);
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      if (now > record.resetTime) {
        this.attempts.delete(key);
      }
    }
  }
}

// Pre-configured rate limiter for auth
const authRateLimiter = new EdgeRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

// Get client identifier for rate limiting
const getClientKey = (req: Request): string => {
  const ip = req.headers.get('x-forwarded-for') || 
            req.headers.get('x-real-ip') || 
            'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  return `${ip}:${userAgent.slice(0, 50)}`;
};

// Validate Origin header for CSRF protection
const validateOrigin = (req: Request, allowedOrigins: string[]): boolean => {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  // For non-browser requests (no origin), check referer
  const sourceUrl = origin || referer;
  
  if (!sourceUrl) {
    return false; // Reject requests with no origin/referer
  }

  try {
    const url = new URL(sourceUrl);
    return allowedOrigins.some(allowed => {
      try {
        const allowedUrl = new URL(allowed);
        return url.hostname === allowedUrl.hostname;
      } catch {
        return false;
      }
    });
  } catch {
    return false;
  }
};

// Sanitize inputs for logging
const sanitizeForLog = (data: any): any => {
  if (typeof data === 'string') {
    return data.replace(/[<>\"'&]/g, '');
  }
  
  if (Array.isArray(data)) {
    return data.map(sanitizeForLog);
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip sensitive fields
      if (['password', 'token', 'secret', 'key'].some(sensitive => 
        key.toLowerCase().includes(sensitive)
      )) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeForLog(value);
      }
    }
    return sanitized;
  }
  
  return data;
};

// Security response helpers
const createSecurityResponse = (
  data: any, 
  status: number = 200, 
  additionalHeaders: Record<string, string> = {}
): Response => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...securityHeaders,
      ...additionalHeaders,
    },
  });
};

const createRateLimitResponse = (remainingAttempts: number): Response => {
  return createSecurityResponse(
    { 
      error: 'Rate limit exceeded', 
      remainingAttempts,
      resetTime: Date.now() + 15 * 60 * 1000 
    }, 
    429,
    { 'Retry-After': '900' } // 15 minutes
  );
};

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