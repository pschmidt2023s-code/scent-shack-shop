import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';
import { 
  securityHeaders, 
  paymentRateLimiter, 
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

interface CouponValidationRequest {
  code: string;
  orderAmount: number;
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
    const { code, orderAmount }: CouponValidationRequest = await req.json();

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
        error: `Minimum order amount: €${(coupon.min_order_amount / 100).toFixed(2)}`,
        valid: false,
        minOrderAmount: coupon.min_order_amount / 100
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
      : Math.min(coupon.discount_value / 100, orderAmount); // Convert from cents

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
        min_order_amount: coupon.min_order_amount / 100, // Convert to euros
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