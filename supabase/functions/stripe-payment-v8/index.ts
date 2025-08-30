import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  perfume: {
    id: string;
    name: string;
    brand: string;
    image: string;
  };
  variant: {
    id: string;
    number: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface PaymentRequest {
  items: CartItem[];
  guestEmail?: string;
  couponCode?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== STRIPE PAYMENT V8 FRESH START ===");
    console.log("Current timestamp:", new Date().toISOString());
    
    // Force fresh environment variable reading
    const env = Deno.env.toObject();
    console.log("Available environment keys:", Object.keys(env).filter(key => 
      key.includes('STRIPE') || key.includes('SUPABASE')
    ));
    
    const stripeKey = env.STRIPE_SECRET_KEY || Deno.env.get("STRIPE_SECRET_KEY");
    const supabaseUrl = env.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = env.SUPABASE_ANON_KEY || Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment variables V8:");
    console.log("- STRIPE_SECRET_KEY:", stripeKey ? `Present (${stripeKey.substring(0, 8)}...)` : "MISSING");
    console.log("- SUPABASE_URL:", supabaseUrl ? "Present" : "MISSING");
    console.log("- SUPABASE_ANON_KEY:", supabaseAnonKey ? "Present" : "MISSING");
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "Present" : "MISSING");

    if (!stripeKey) {
      console.error("CRITICAL: STRIPE_SECRET_KEY is not available");
      console.error("Full environment dump:", JSON.stringify(env, null, 2));
      return new Response(JSON.stringify({ 
        error: "STRIPE_SECRET_KEY not found",
        availableEnvKeys: Object.keys(env),
        debug: "Function V8 - Stripe key completely missing"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("CRITICAL: Supabase configuration missing");
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing",
        debug: "Function V8 - Supabase not configured"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("✅ All environment variables found - proceeding with payment");

    // Parse request
    const requestBody = await req.text();
    console.log("Request body:", requestBody);
    
    let paymentData: PaymentRequest;
    try {
      paymentData = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return new Response(JSON.stringify({ 
        error: "Invalid JSON in request body",
        debug: parseError.message
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { items, guestEmail, couponCode } = paymentData;
    console.log("Parsed payment data:", { itemCount: items?.length, guestEmail, couponCode });

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No items in cart"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Get user if authenticated
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      console.log("Authentication header found, getting user...");
      const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      const token = authHeader.replace("Bearer ", "");
      const { data, error } = await supabaseClient.auth.getUser(token);
      if (error) {
        console.error("Auth error:", error);
      } else {
        user = data.user;
        console.log("User authenticated:", user?.email);
      }
    }

    const customerEmail = user?.email || guestEmail;
    if (!customerEmail) {
      return new Response(JSON.stringify({ 
        error: "Email address required"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Initializing Stripe with key:", stripeKey.substring(0, 15) + "...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Test Stripe connection
    try {
      console.log("Testing Stripe connection...");
      await stripe.products.list({ limit: 1 });
      console.log("✅ Stripe connection successful");
    } catch (stripeTestError) {
      console.error("❌ Stripe connection failed:", stripeTestError);
      return new Response(JSON.stringify({ 
        error: "Stripe connection failed",
        details: stripeTestError.message,
        debug: "Stripe API key might be invalid"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Calculate totals and create line items
    let subtotal = 0;
    const lineItems = items.map(item => {
      const itemTotal = item.variant.price * 100 * item.quantity; // Convert to cents
      subtotal += itemTotal;
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.perfume.brand} - ${item.variant.name}`,
            metadata: {
              perfume_id: item.perfume.id,
              variant_id: item.variant.id,
            },
          },
          unit_amount: item.variant.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    console.log("Creating Stripe checkout session...");
    console.log("Line items:", lineItems.length);
    console.log("Subtotal (cents):", subtotal);

    const sessionConfig = {
      customer_email: customerEmail,
      line_items: lineItems,
      mode: "payment" as const,
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
      payment_method_types: [
        'card',
        'sepa_debit',
        'giropay',
        'sofort',
        'klarna',
        'paypal'
      ],
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount' as const,
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Kostenloser Versand (Deutschland)',
          },
        },
      ],
      metadata: {
        user_id: user?.id || 'guest',
        guest_email: guestEmail || '',
        coupon_code: couponCode || '',
      },
      automatic_tax: {
        enabled: true,
      },
      phone_number_collection: {
        enabled: true,
      },
    };

    console.log("Session config prepared:", JSON.stringify(sessionConfig, null, 2));

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log("✅ Stripe session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      debug: "V8 - Success"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("=== V8 PAYMENT ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error",
      type: error.constructor.name,
      debug: "V8 - Critical error occurred",
      stack: error.stack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});