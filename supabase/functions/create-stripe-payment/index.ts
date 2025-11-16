import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE STRIPE PAYMENT ===");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const { items, customerEmail, customerData, metadata } = await req.json();
    console.log("Request data:", { itemCount: items?.length, customerEmail });

    if (!items || items.length === 0) {
      throw new Error("No items provided");
    }
    if (!customerEmail) {
      throw new Error("Customer email is required");
    }

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2023-10-16",
    });

    // Check for existing customer
    const customers = await stripe.customers.list({ 
      email: customerEmail, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
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
      console.log("Created new customer:", customerId);
    }

    // Build line items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name || 'Produkt',
          description: item.description || undefined,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round((item.price || 0) * 100),
      },
      quantity: item.quantity || 1,
    }));

    console.log("Line items created:", lineItems.length);

    // Get origin from request headers - EXACTLY like create-stripe-checkout
    const origin = req.headers.get("origin");
    console.log("Origin:", origin);

    // Create checkout session - NO PLACEHOLDER in URL
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout-success`,
      cancel_url: `${origin}/checkout-cancel`,
      metadata: {
        ...metadata,
        customer_email: customerEmail,
        order_number: metadata?.order_number || '',
        order_id: metadata?.order_id || '',
      },
    });

    console.log("SUCCESS - Session created:", session.id);
    console.log("Session URL:", session.url);

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
    console.error("ERROR:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
