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
    console.log("=== NEW STRIPE PAYMENT FUNCTION ===");
    
    const body = await req.json();
    const { amount, customerEmail } = body;
    console.log("Processing payment:", { amount, customerEmail });
    
    // Ihr Stripe Secret Key direkt hier (temporär für den Test)
    const stripeKey = "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";
    
    if (!stripeKey) {
      throw new Error("Stripe key not available");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: "eur",
          product_data: { 
            name: "ALDENAIR Parfüm Probe",
            description: "Hochwertige Parfümprobe 5ml"
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      customer_email: customerEmail,
    });

    console.log("Stripe session created successfully:", session.id);

    return new Response(JSON.stringify({ 
      success: true,
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Stripe payment error:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});