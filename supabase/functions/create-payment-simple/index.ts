import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Enhanced security headers
const securityHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'"
};

// Rate limiting for payment attempts
class PaymentRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + 5 * 60 * 1000 }); // 5 min window
      return true;
    }
    
    if (record.count >= 3) { // Max 3 payment attempts per 5 minutes
      return false;
    }
    
    record.count++;
    return true;
  }
}

const paymentLimiter = new PaymentRateLimiter();

// CSRF protection
const validateOrigin = (req: Request): boolean => {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'http://localhost:8080',
    'https://aldenairperfumes.de',
    'https://tqswuibgnkdvrfocwjou.supabase.co'
  ];
  
  return origin ? allowedOrigins.some(allowed => origin.includes(allowed)) : false;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    console.log("=== STRIPE PAYMENT MINIMAL START ===");
    
    // CSRF protection
    if (!validateOrigin(req)) {
      console.error("Invalid origin detected");
      return new Response(JSON.stringify({ 
        error: "Invalid origin" 
      }), {
        headers: { ...securityHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }
    
    // Rate limiting
    const clientKey = req.headers.get('x-forwarded-for') || 'unknown';
    if (!paymentLimiter.isAllowed(clientKey)) {
      console.log(`Payment rate limit exceeded for: ${clientKey}`);
      return new Response(JSON.stringify({ 
        error: "Too many payment attempts. Please try again later." 
      }), {
        headers: { 
          ...securityHeaders, 
          "Content-Type": "application/json",
          "Retry-After": "300" 
        },
        status: 429,
      });
    }
    
    // Get Stripe key from request body
    const { items, stripeKey } = await req.json();
    console.log("Items received:", items?.length || 0);
    
    if (!stripeKey || typeof stripeKey !== 'string') {
      throw new Error("Valid Stripe key required");
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    console.log("Initializing Stripe...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Validate and sanitize items
    const lineItems = items.map(item => {
      if (!item.perfume?.brand || !item.variant?.name) {
        throw new Error("Invalid item structure");
      }
      
      const price = Number(item.variant?.price || item.price || 4.99);
      if (isNaN(price) || price <= 0 || price > 9999) {
        throw new Error("Invalid price");
      }
      
      const quantity = Number(item.quantity || 1);
      if (isNaN(quantity) || quantity <= 0 || quantity > 99) {
        throw new Error("Invalid quantity");
      }
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.perfume.brand} - ${item.variant.name || item.perfume.name}`.slice(0, 200),
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: quantity,
      };
    });

    console.log("Creating minimal checkout session...");
    
    // Create minimal Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
    });

    console.log("Session created successfully:");
    console.log("- Session ID:", session.id);
    console.log("- Session URL:", session.url);
    console.log("- URL length:", session.url?.length);
    console.log("- URL starts with https:", session.url?.startsWith('https://'));
    console.log("- URL contains stripe.com:", session.url?.includes('stripe.com'));

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      debug: {
        urlLength: session.url?.length,
        urlValid: session.url?.startsWith('https://checkout.stripe.com')
      }
    }), {
      headers: { ...securityHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("PAYMENT ERROR:", error.message);
    
    return new Response(JSON.stringify({ 
      error: "Payment processing failed" // Don't expose internal error details
    }), {
      headers: { ...securityHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});