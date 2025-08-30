import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { encode as base64Encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

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

    // PayPal Sandbox Credentials - verwende immer funktionierende Test-Credentials
    const PAYPAL_CLIENT_ID = "AeA1QIZXiflr1_-r0U2UbWSxjGYYiQDq-zBULVxeGwH8z5_2eOhjp8wQg2RCgQoHb5kRK6K6r6O2qGGh";
    const PAYPAL_SECRET = "EGFtTBosAui9kJdPxfanqoY9SlEShDiJxXNIOXfMIV9MZpyZo2VzWM4KJjKfyXzPrGC3wHhFROZYLHoH";

    // Debugging - prüfe aktuelle Credentials
    console.log("PayPal Client ID being used:", PAYPAL_CLIENT_ID);
    console.log("PayPal Secret exists:", !!PAYPAL_SECRET);
    console.log("PayPal Secret length:", PAYPAL_SECRET?.length || 0);

    if (!PAYPAL_SECRET) {
      console.error("PayPal secret key not configured");
      throw new Error("PayPal secret key not configured");
    }

    // Get PayPal access token
    console.log("Getting PayPal access token...");
    const authString = `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`;
    const encodedAuth = base64Encode(new TextEncoder().encode(authString));
    
    console.log("Auth string prepared, making request...");

    // Make request to PayPal sandbox
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
    
    // Fehlerbehebung: Erweiterte Fehlerbehandlung für PayPal Auth
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal auth failed with status:", authResponse.status);
      console.error("PayPal auth error response:", errorText);
      
      throw new Error(`PayPal auth failed: ${errorText}`);
    }

    const authData = await authResponse.json();
    console.log("PayPal auth successful, got access token");

    const accessToken = authData.access_token;
    if (!accessToken) {
      throw new Error("No access token received from PayPal");
    }

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

    console.log("Order payload prepared, making request...");

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

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("PayPal order creation failed with status:", orderResponse.status);
      console.error("PayPal order error response:", errorText);
      throw new Error(`PayPal order creation failed: ${errorText}`);
    }

    const orderData = await orderResponse.json();
    console.log("PayPal order created successfully:", orderData.id);

    // Find approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("PayPal approval URL not found in response");
      console.error("Available links:", orderData.links);
      throw new Error("PayPal approval URL not found");
    }

    console.log("Approval URL found:", approvalUrl);

    return new Response(JSON.stringify({
      paypal_order_id: orderData.id,
      approval_url: approvalUrl,
      status: orderData.status
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("=== PayPal Function Error ===");
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