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
    image: string;
  };
  variant: {
    id: string;
    number: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface PaymentRequest {
  items: CartItem[];
  guestEmail?: string;
  couponCode?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== STRIPE PAYMENT FUNCTION v3 START ===");
    
    // Log all environment variables for debugging
    const allEnvVars = Deno.env.toObject();
    console.log("Available environment variables:", Object.keys(allEnvVars));
    
    // Check critical environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    console.log("Environment check:", {
      supabaseUrl: supabaseUrl ? "✓ Set" : "✗ Missing",
      supabaseKey: supabaseKey ? "✓ Set" : "✗ Missing", 
      supabaseServiceKey: supabaseServiceKey ? "✓ Set" : "✗ Missing",
      stripeKey: stripeKey ? "✓ Set" : "✗ Missing"
    });

    if (!stripeKey) {
      console.error("STRIPE_SECRET_KEY not found in environment variables");
      console.error("This usually means the secret was not properly configured");
      throw new Error("Stripe-Zahlungen sind derzeit nicht verfügbar. Bitte versuchen Sie eine andere Zahlungsmethode.");
    }

    console.log("Parsing request body...");
    const { items, guestEmail, couponCode }: PaymentRequest = await req.json();
    console.log("Request data:", { itemCount: items?.length, guestEmail, couponCode });

    if (!items || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    // Get user if authenticated
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const supabaseClient = createClient(supabaseUrl ?? "", supabaseKey ?? "");
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
      console.log("User authenticated:", user ? "Yes" : "No");
    }

    // Use user email or guest email
    const customerEmail = user?.email || guestEmail;
    console.log("Customer email:", customerEmail);
    
    if (!customerEmail) {
      throw new Error("E-Mail-Adresse erforderlich");
    }

    console.log("Initializing Stripe with provided key...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    console.log("Checking for existing Stripe customer...");
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      console.log("No existing customer found, will create one during checkout");
    }

    // Calculate totals and create line items
    let subtotal = 0;
    const lineItems = items.map(item => {
      const itemTotal = item.variant.price * 100 * item.quantity; // Convert to cents
      subtotal += itemTotal;
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.perfume.brand} - ${item.variant.name}`,
            metadata: {
              perfume_id: item.perfume.id,
              variant_id: item.variant.id,
            },
          },
          unit_amount: item.variant.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    console.log("Subtotal calculated:", subtotal, "cents");

    // Handle 0€ orders (free orders)
    if (subtotal === 0) {
      console.log("Free order detected, redirecting to success page");
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/checkout/success?free_order=true`,
        free_order: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Creating Stripe checkout session...");
    
    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
      payment_method_types: [
        'card',
        'sepa_debit',
        'giropay',
        'sofort',
        'klarna',
        'paypal'
      ],
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Kostenloser Versand (Deutschland)',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
      ],
      metadata: {
        user_id: user?.id || 'guest',
        guest_email: guestEmail || '',
      },
      automatic_tax: {
        enabled: true,
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log("Stripe session created successfully:", session.id);
    console.log("Checkout URL:", session.url);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("=== PAYMENT ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    if (error.stack) {
      console.error("Error stack:", error.stack);
    }
    
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});