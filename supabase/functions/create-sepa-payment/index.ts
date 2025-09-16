import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== SEPA PAYMENT CREATION ===");
    
    const { items, customerEmail, orderNumber, customerData } = await req.json();
    console.log("Request data:", { items: items?.length, customerEmail, orderNumber });
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    console.log("Stripe initialized for SEPA");

    // Convert items to Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.perfume?.name || item.name} - ${item.variant?.name || item.selectedVariant}`,
          description: item.variant?.description || item.description || '',
        },
        unit_amount: Math.round((item.variant?.price || item.price) * 100), // Price in cents
      },
      quantity: item.quantity,
    }));

    console.log("Line items created:", lineItems.length);

    // Create Stripe Checkout Session for SEPA Direct Debit
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: "payment",
      payment_method_types: ["sepa_debit"],
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      customer_email: customerEmail,
      client_reference_id: orderNumber,
      automatic_tax: { enabled: false },
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["DE", "AT", "CH", "NL", "BE", "FR"],
      },
      payment_intent_data: {
        setup_future_usage: "off_session", // For future payments
      },
    });

    console.log("Stripe SEPA session created:", session.id);

    return new Response(JSON.stringify({ 
      success: true, 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("SEPA Payment Error:", error.message);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});