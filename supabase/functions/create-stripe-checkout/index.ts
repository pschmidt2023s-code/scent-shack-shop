import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ULTRA SIMPLE STRIPE START ===");
    
    const { amount = 4.99 } = await req.json();
    console.log("Amount:", amount);
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key from env:", !!stripeKey);
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured in environment");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { name: "ALDENAIR Probe" },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
    });

    console.log("SUCCESS - Session URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("ERROR:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});