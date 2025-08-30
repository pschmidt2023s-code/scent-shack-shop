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
    
    const requestBody: PayPalOrderRequest = await req.json();
    console.log("PayPal payment request:", requestBody);

    const { order_id, amount, currency, order_number, customer_email } = requestBody;

    const PAYPAL_CLIENT_ID = "ASXKkF8na7K9EDHUSfNrKqtgY005FbvJQcPGJ_FCdSLxcNW1enPCEqsem9WDoqN1S5FBisBlKvy5deH7";
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET_KEY");

    console.log("PayPal Client ID exists:", !!PAYPAL_CLIENT_ID);
    console.log("PayPal Secret exists:", !!PAYPAL_SECRET);

    if (!PAYPAL_SECRET) {
      console.error("PayPal secret key not configured");
      throw new Error("PayPal secret key not configured");
    }

    // Get PayPal access token
    console.log("Getting PayPal access token...");
    const authString = `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`;
    const encodedAuth = btoa(authString);
    
    console.log("Auth string length:", authString.length);
    console.log("Encoded auth length:", encodedAuth.length);

    const authResponse = await fetch("https://api-m.sandbox.paypal.com/v1/oauth2/token", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    console.log("PayPal auth response status:", authResponse.status);
    const authData = await authResponse.json();
    console.log("PayPal auth response:", authData);

    if (!authResponse.ok) {
      const errorMessage = `PayPal auth failed: ${authData.error_description || authData.error || 'Unknown error'}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const accessToken = authData.access_token;
    console.log("Access token received:", !!accessToken);

    // Create PayPal order
    console.log("Creating PayPal order...");
    const orderPayload = {
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
    };

    console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

    const orderResponse = await fetch("https://api-m.sandbox.paypal.com/v2/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": order_id
      },
      body: JSON.stringify(orderPayload)
    });

    console.log("PayPal order response status:", orderResponse.status);
    const orderData = await orderResponse.json();
    console.log("PayPal order response:", orderData);

    if (!orderResponse.ok) {
      const errorMessage = `PayPal order creation failed: ${orderData.message || orderData.error || 'Unknown error'}`;
      console.error(errorMessage);
      console.error("Full PayPal error response:", JSON.stringify(orderData, null, 2));
      throw new Error(errorMessage);
    }

    // Find approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("PayPal approval URL not found in response");
      console.error("Available links:", orderData.links);
      throw new Error("PayPal approval URL not found");
    }

    console.log("PayPal order created successfully:", orderData.id);
    console.log("Approval URL:", approvalUrl);

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
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while creating PayPal payment",
      details: error.name || "UnknownError"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});