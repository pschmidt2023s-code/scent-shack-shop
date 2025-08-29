import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PayPalOrderRequest {
  order_id: string;
  amount: number;
  currency: string;
  order_number: string;
  customer_email: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE PAYPAL PAYMENT START ===");
    
    const { order_id, amount, currency, order_number, customer_email }: PayPalOrderRequest = await req.json();
    console.log("PayPal payment request:", { order_id, amount, currency, order_number });

    const PAYPAL_CLIENT_ID = "ASXKkF8na7K9EDHUSfNrKqtgY005FbvJQcPGJ_FCdSLxcNW1enPCEqsem9WDoqN1S5FBisBlKvy5deH7";
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET_KEY");

    if (!PAYPAL_SECRET) {
      throw new Error("PayPal secret key not configured");
    }

    // Get PayPal access token
    console.log("Getting PayPal access token...");
    const authResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`)}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    const authData = await authResponse.json();
    console.log("PayPal auth response:", authData);

    if (!authResponse.ok) {
      throw new Error(`PayPal auth failed: ${authData.error_description || authData.error}`);
    }

    const accessToken = authData.access_token;

    // Create PayPal order
    console.log("Creating PayPal order...");
    const orderResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": order_id
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          reference_id: order_number,
          amount: {
            currency_code: currency.toUpperCase(),
            value: amount.toFixed(2)
          },
          description: `Parfüm-Bestellung ${order_number}`,
          custom_id: order_id
        }],
        application_context: {
          brand_name: "AdN Parfümerie",
          locale: "de-DE",
          user_action: "PAY_NOW",
          return_url: `${new URL(req.url).origin}/checkout-success?paypal=true&order=${order_number}`,
          cancel_url: `${new URL(req.url).origin}/checkout-cancel`
        }
      })
    });

    const orderData = await orderResponse.json();
    console.log("PayPal order response:", orderData);

    if (!orderResponse.ok) {
      throw new Error(`PayPal order creation failed: ${orderData.message || 'Unknown error'}`);
    }

    // Find approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      throw new Error("PayPal approval URL not found");
    }

    console.log("PayPal order created successfully:", orderData.id);

    return new Response(JSON.stringify({
      paypal_order_id: orderData.id,
      approval_url: approvalUrl,
      status: orderData.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in create-paypal-payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while creating PayPal payment"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});