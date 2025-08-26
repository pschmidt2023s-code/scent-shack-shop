
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
    price: number;
    image: string;
  };
  quantity: number;
}

interface PaymentRequest {
  items: CartItem[];
  guestEmail?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { items, guestEmail, shippingAddress }: PaymentRequest = await req.json();

    if (!items || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    // Get user if authenticated
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    // Use user email or guest email
    const customerEmail = user?.email || guestEmail;
    if (!customerEmail) {
      throw new Error("E-Mail-Adresse erforderlich");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate total (all items at 44.99€)
    const totalAmount = items.reduce((sum, item) => sum + (4499 * item.quantity), 0);

    // Create line items for Stripe
    const lineItems = items.map(item => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: `${item.perfume.brand} - ${item.perfume.name}`,
          images: [item.perfume.image],
        },
        unit_amount: 4499, // 44.99€ in cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR'],
      },
      metadata: {
        user_id: user?.id || 'guest',
        guest_email: guestEmail || '',
      },
    });

    // Save order to database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    await supabaseService.from("orders").insert({
      user_id: user?.id || null,
      guest_email: user ? null : customerEmail,
      stripe_session_id: session.id,
      amount: totalAmount,
      currency: "eur",
      status: "pending",
      items: items,
      shipping_address: shippingAddress,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
