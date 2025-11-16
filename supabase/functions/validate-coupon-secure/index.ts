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

// Pre-configured rate limiter for payment operations
const paymentRateLimiter = new EdgeRateLimiter(3, 5 * 60 * 1000); // 3 attempts per 5 minutes

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
      resetTime: Date.now() + 5 * 60 * 1000 
    }, 
    429,
    { 'Retry-After': '300' } // 5 minutes
  );
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CouponValidationRequest {
  code?: string;
  couponCode?: string;
  orderAmount: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: { ...corsHeaders, ...securityHeaders } });
  }

  // Validate origin for CSRF protection
  const allowedOrigins = [
    'https://autoparfuem-de.lovable.app',
    'https://8e9b04f2-784a-4e4d-aa8a-9a93b82040fa.lovableproject.com',
    'http://localhost:8080',
    'https://localhost:8080'
  ];
  
  if (!validateOrigin(req, allowedOrigins)) {
    console.error('Invalid origin:', req.headers.get('origin'));
    return createSecurityResponse({ error: 'Invalid origin' }, 403);
  }

  // Rate limiting for payment-related operations
  const clientKey = getClientKey(req);
  if (!paymentRateLimiter.isAllowed(clientKey)) {
    const remainingAttempts = paymentRateLimiter.getRemainingAttempts(clientKey);
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

    // Parse and validate request body
    const body: CouponValidationRequest = await req.json();
    const code = body.code || body.couponCode;
    const orderAmount = body.orderAmount;

    // Enhanced input validation
    if (!code || typeof code !== 'string') {
      return createSecurityResponse({ error: 'Coupon code is required' }, 400);
    }

    if (typeof orderAmount !== 'number' || orderAmount < 0) {
      return createSecurityResponse({ error: 'Valid order amount is required' }, 400);
    }

    // Sanitize coupon code
    const sanitizedCode = code.trim().toUpperCase();
    
    // Validate code format (alphanumeric, max 20 chars)
    if (!/^[A-Z0-9]+$/.test(sanitizedCode) || sanitizedCode.length > 20) {
      return createSecurityResponse({ 
        error: 'Invalid coupon code format',
        valid: false 
      }, 400);
    }

    // Fetch coupon from database
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', sanitizedCode)
      .eq('active', true)
      .single();

    if (fetchError || !coupon) {
      console.log('Coupon validation failed:', sanitizeForLog({
        code: sanitizedCode,
        error: fetchError?.message || 'Not found',
        clientKey
      }));
      
      return createSecurityResponse({ 
        error: 'Invalid coupon code',
        valid: false
      }, 400);
    }

    // Validate coupon constraints
    const now = new Date();
    
    // Check validity dates
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return createSecurityResponse({ 
        error: 'Coupon not yet valid',
        valid: false
      }, 400);
    }

    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return createSecurityResponse({ 
        error: 'Coupon has expired',
        valid: false
      }, 400);
    }

    // Check minimum order amount
    if (coupon.min_order_amount && orderAmount < coupon.min_order_amount) {
      return createSecurityResponse({ 
        error: `Minimum order amount: €${coupon.min_order_amount.toFixed(2)}`,
        valid: false,
        minOrderAmount: coupon.min_order_amount
      }, 400);
    }

    // Check usage limits
    if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
      return createSecurityResponse({ 
        error: 'Coupon usage limit reached',
        valid: false
      }, 400);
    }

    // Calculate discount amount
    const discountAmount = coupon.discount_type === 'percentage' 
      ? Math.min(orderAmount * (coupon.discount_value / 100), orderAmount)
      : Math.min(coupon.discount_value, orderAmount);

    // Log successful validation
    console.log('Coupon validated successfully:', sanitizeForLog({
      code: sanitizedCode,
      discountAmount,
      orderAmount,
      timestamp: new Date().toISOString(),
      clientKey
    }));

    return createSecurityResponse({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
        min_order_amount: coupon.min_order_amount,
        description: coupon.description
      },
      discountAmount,
      finalAmount: orderAmount - discountAmount
    });

  } catch (error) {
    console.error('Coupon validation error:', sanitizeForLog(error));
    return createSecurityResponse({ error: 'Internal server error' }, 500);
  }
};

serve(handler);