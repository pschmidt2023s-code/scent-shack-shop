import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-STRIPE-PAYMENT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    // Get request body
    const { items, customerEmail, customerData, metadata } = await req.json();
    logStep("Request data received", { itemsCount: items?.length, customerEmail });

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }

    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Check if customer exists
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const newCustomer = await stripe.customers.create({
        email: customerEmail,
        name: customerData?.firstName && customerData?.lastName 
          ? `${customerData.firstName} ${customerData.lastName}` 
          : undefined,
        phone: customerData?.phone || undefined,
        address: customerData?.street ? {
          line1: customerData.street,
          city: customerData.city,
          postal_code: customerData.postalCode,
          country: 'DE',
        } : undefined,
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || item.variant?.name || 'Produkt',
          description: item.description || item.variant?.description || undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round((item.price || item.variant?.price || 0) * 100), // Convert to cents
      },
      quantity: item.quantity || 1,
    }));

    logStep("Line items prepared", { lineItemsCount: lineItems.length });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout-cancel`,
      metadata: {
        ...metadata,
        customer_email: customerEmail,
      },
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH'],
      },
      billing_address_collection: 'required',
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

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
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});