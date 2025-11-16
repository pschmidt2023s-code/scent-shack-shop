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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const { items, customerEmail, customerData, metadata } = await req.json();

    if (!items || items.length === 0) throw new Error("No items provided");
    if (!customerEmail) throw new Error("Customer email is required");

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Check for existing customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerData?.firstName && customerData?.lastName 
          ? `${customerData.firstName} ${customerData.lastName}` 
          : undefined,
      });
      customerId = newCustomer.id;
    }

    // Build line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name || 'Produkt' },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout-success`,
      cancel_url: `${req.headers.get("origin")}/checkout-cancel`,
      metadata: {
        customer_email: customerEmail,
        order_number: metadata?.order_number || '',
        order_id: metadata?.order_id || '',
      },
    });

    console.log("✓ Session created successfully");
    console.log("Session ID:", session.id);
    console.log("Session URL:", session.url);
    console.log("URL length:", session.url?.length);

    if (!session.url) {
      throw new Error("No checkout URL returned from Stripe");
    }

    return new Response(
      JSON.stringify({ 
        url: session.url,
        sessionId: session.id 
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("✗ ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
