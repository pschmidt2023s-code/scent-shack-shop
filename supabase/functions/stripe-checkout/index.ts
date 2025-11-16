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
    console.log("=== STRIPE CHECKOUT START ===");
    
    const body = await req.json();
    console.log("Request body:", JSON.stringify(body));
    
    const { items, customerEmail, orderNumber } = body;
    
    if (!items || !Array.isArray(items)) {
      throw new Error("Items fehlen oder sind ungültig");
    }
    
    if (!customerEmail) {
      throw new Error("Customer email fehlt");
    }
    
    console.log("Items count:", items.length);
    console.log("Customer email:", customerEmail);
    console.log("Order number:", orderNumber);
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("Stripe key exists:", !!stripeKey);
    
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil",
      httpClient: Stripe.createFetchHttpClient(),
    });
    console.log("Stripe initialized");

    const lineItems = items.map((item: any) => {
      const name = item.perfume?.name || item.name || 'Produkt';
      const variant = item.variant?.name || item.selectedVariant || '';
      const price = item.variant?.price || item.price || 0;
      
      console.log("Processing item:", { name, variant, price, quantity: item.quantity });
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${name} - ${variant}`,
          },
          unit_amount: Math.round(price * 100),
        },
        quantity: item.quantity || 1,
      };
    });

    console.log("Line items created:", lineItems.length);

    const origin = req.headers.get("origin") || "https://tqswuibgnkdvrfocwjou.supabase.co";
    console.log("Origin:", origin);

    const sessionData = {
      line_items: lineItems,
      mode: "payment" as const,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout`,
      customer_email: customerEmail,
      client_reference_id: orderNumber,
    };

    console.log("Creating Stripe session...");
    const session = await stripe.checkout.sessions.create(sessionData);

    console.log("✅ Session created successfully!");
    console.log("Session ID:", session.id);
    console.log("Checkout URL:", session.url);
    console.log("URL length:", session.url?.length);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error: any) {
    console.error("❌ ERROR:", error.message);
    console.error("Error stack:", error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
