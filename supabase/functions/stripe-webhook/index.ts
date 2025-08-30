import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== STRIPE WEBHOOK START ===");
    console.log(`Request method: ${req.method}`);
    console.log(`Request URL: ${req.url}`);
    
    // Get environment variables
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("Environment check:", {
      stripeSecretKey: stripeSecretKey ? "✓ Set" : "✗ Missing",
      webhookSecret: webhookSecret ? "✓ Set" : "✗ Missing",
      supabaseUrl: supabaseUrl ? "✓ Set" : "✗ Missing",
      supabaseServiceKey: supabaseServiceKey ? "✓ Set" : "✗ Missing"
    });

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing required environment variables");
      return new Response(JSON.stringify({ 
        error: "Missing required environment variables",
        missing: {
          stripeSecretKey: !stripeSecretKey,
          supabaseUrl: !supabaseUrl,
          supabaseServiceKey: !supabaseServiceKey
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("Environment variables verified");

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Initialize Supabase with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Get the raw body and signature
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature) {
      console.error("No Stripe signature found");
      throw new Error("No Stripe signature found");
    }

    console.log("Stripe signature found, verifying webhook...");

    // Verify webhook signature if webhook secret is configured
    let event: Stripe.Event;
    if (webhookSecret) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("Webhook signature verified successfully");
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        return new Response(`Webhook signature verification failed: ${err}`, { 
          status: 400,
          headers: corsHeaders
        });
      }
    } else {
      // Parse event without verification (for development)
      console.log("No webhook secret configured, parsing event without verification");
      event = JSON.parse(body);
    }

    console.log(`Processing event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      
      case "checkout.session.expired":
        await handleCheckoutSessionExpired(event.data.object as Stripe.Checkout.Session, supabase);
        break;
      
      case "payment_intent.payment_failed":
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent, supabase);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    console.log("=== STRIPE WEBHOOK SUCCESS ===");
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("=== STRIPE WEBHOOK ERROR ===");
    console.error("Error message:", error.message);
    console.error("Error details:", error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, supabase: any) {
  console.log(`Processing checkout.session.completed for session: ${session.id}`);
  
  try {
    // Update order status to 'paid'
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status: "paid",
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", session.id)
      .select();

    if (error) {
      console.error("Database error updating order:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Order updated successfully: ${data[0].id}`);
      
      // Trigger additional actions if needed (send email, create payback earning, etc.)
      if (data[0].user_id) {
        try {
          // Create payback earning for the user
          const totalAmount = parseFloat(data[0].total_amount || 0);
          if (totalAmount > 0) {
            console.log(`Creating payback earning for order ${data[0].id}`);
            await supabase.functions.invoke('create-payback-earning', {
              body: {
                userId: data[0].user_id,
                orderId: data[0].id,
                amount: totalAmount
              }
            });
          }
        } catch (paybackError) {
          console.error("Failed to create payback earning:", paybackError);
          // Don't fail the webhook for this
        }

        try {
          // Send order confirmation email
          console.log(`Sending order confirmation for order ${data[0].order_number}`);
          await supabase.functions.invoke('send-order-confirmation', {
            body: {
              orderId: data[0].id,
              email: data[0].customer_email || session.customer_details?.email,
              orderNumber: data[0].order_number
            }
          });
        } catch (emailError) {
          console.error("Failed to send order confirmation:", emailError);
          // Don't fail the webhook for this
        }
      }
    } else {
      console.log(`No order found with stripe_session_id: ${session.id}`);
    }

  } catch (error) {
    console.error("Error in handleCheckoutSessionCompleted:", error);
    throw error;
  }
}

async function handleCheckoutSessionExpired(session: Stripe.Checkout.Session, supabase: any) {
  console.log(`Processing checkout.session.expired for session: ${session.id}`);
  
  try {
    const { data, error } = await supabase
      .from("orders")
      .update({ 
        status: "expired",
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", session.id)
      .select();

    if (error) {
      console.error("Database error updating expired order:", error);
      throw error;
    }

    if (data && data.length > 0) {
      console.log(`Order marked as expired: ${data[0].id}`);
    } else {
      console.log(`No order found with stripe_session_id: ${session.id}`);
    }

  } catch (error) {
    console.error("Error in handleCheckoutSessionExpired:", error);
    throw error;
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  console.log(`Processing payment_intent.payment_failed for payment intent: ${paymentIntent.id}`);
  
  try {
    // Find order by checking checkout sessions linked to this payment intent
    // This is more complex as we need to find the session first
    console.log("Looking for related checkout session...");
    
    // For now, we can log this event but may need additional logic
    // to link payment intents back to orders if needed
    console.log(`Payment failed for payment intent: ${paymentIntent.id}`);
    console.log(`Failure reason: ${paymentIntent.last_payment_error?.message || 'Unknown'}`);

  } catch (error) {
    console.error("Error in handlePaymentIntentFailed:", error);
    throw error;
  }
}