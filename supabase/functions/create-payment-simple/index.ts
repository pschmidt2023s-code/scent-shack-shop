import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== STRIPE PAYMENT MINIMAL START ===");
    
    // Get Stripe key from request body
    const { items, stripeKey } = await req.json();
    console.log("Items received:", items?.length || 0);
    
    if (!stripeKey) {
      throw new Error("Stripe key required");
    }
    
    if (!items || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    console.log("Initializing Stripe...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Create simple line items
    const lineItems = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.perfume.brand} - ${item.variant.name || item.perfume.name}`,
        },
        unit_amount: Math.round((item.variant?.price || item.price || 4.99) * 100),
      },
      quantity: item.quantity || 1,
    }));

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
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("PAYMENT ERROR:", error.message);
    
    return new Response(JSON.stringify({ 
      error: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});