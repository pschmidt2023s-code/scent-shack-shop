import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderNumber, items, totalAmount, customerEmail } = await req.json();
    
    console.log('Creating Stripe payment for order:', orderNumber);
    
    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create line items dynamically from the order items
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.perfume?.name || item.name} - ${item.variant?.name || item.selectedVariant}`,
          description: item.variant?.description || `${item.perfume?.brand || item.brand} Probe`,
        },
        unit_amount: Math.round((item.variant?.price || item.price) * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    console.log('Creating Stripe session with line items:', lineItems);

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${req.headers.get("origin")}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      customer_email: customerEmail,
      client_reference_id: orderNumber,
      metadata: {
        order_number: orderNumber,
        total_amount: totalAmount.toString(),
      }
    });

    console.log('Stripe session created successfully:', session.id);

    return new Response(JSON.stringify({ 
      success: true,
      checkout_url: session.url,
      session_id: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error('Stripe payment creation failed:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});