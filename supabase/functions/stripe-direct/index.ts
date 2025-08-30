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
  stripeKey?: string; // Temporär für Testing
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== STRIPE DIRECT START ===");
    console.log("Current timestamp:", new Date().toISOString());

    // Parse request
    const { items, guestEmail, couponCode, stripeKey }: PaymentRequest = await req.json();
    console.log("Request data:", { itemCount: items?.length, guestEmail, couponCode, hasStripeKey: !!stripeKey });

    if (!items || items.length === 0) {
      return new Response(JSON.stringify({ 
        error: "No items in cart"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Use provided stripe key or try environment
    let finalStripeKey = stripeKey;
    if (!finalStripeKey) {
      finalStripeKey = Deno.env.get("STRIPE_SECRET_KEY");
      console.log("Using environment key:", !!finalStripeKey);
    } else {
      console.log("Using provided key:", finalStripeKey.substring(0, 12) + "...");
    }

    if (!finalStripeKey) {
      return new Response(JSON.stringify({ 
        error: "STRIPE_SECRET_KEY not available - please provide in request body for testing",
        instruction: "Add your Stripe key as 'stripeKey' in the request body"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get Supabase configuration
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Get user if authenticated
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      console.log("Getting authenticated user...");
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

    console.log("Initializing Stripe with direct key...");
    const stripe = new Stripe(finalStripeKey, {
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
        debug: "Check your Stripe API key"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Calculate totals and create line items
    let subtotal = 0;
    const lineItems = items.map(item => {
      const itemTotal = item.variant.price * 100 * item.quantity;
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
          unit_amount: item.variant.price * 100,
        },
        quantity: item.quantity,
      };
    });

    console.log("Creating Stripe checkout session...");
    console.log("Line items:", lineItems.length);
    console.log("Subtotal (cents):", subtotal);

    const session = await stripe.checkout.sessions.create({
      customer_email: customerEmail,
      line_items: lineItems,
      mode: "payment",
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
            type: 'fixed_amount',
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
    });

    console.log("✅ Stripe session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id,
      debug: "Direct key - Success"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("=== DIRECT PAYMENT ERROR ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error",
      type: error.constructor.name,
      debug: "Direct key - Critical error occurred",
      stack: error.stack
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});