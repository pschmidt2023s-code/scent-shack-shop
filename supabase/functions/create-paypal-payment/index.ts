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
    console.log("=== PAYPAL PAYMENT FUNCTION START ===");
    
    const requestBody: PayPalOrderRequest = await req.json();
    console.log("Request received:", requestBody);
    
    // Bei 100% Rabatt: Fehler vermeiden
    if (requestBody.amount <= 0) {
      console.log("⚠️ Amount is 0 or negative - cannot create PayPal order");
      const errorMsg = "Der Bestellbetrag ist 0. Bitte verwenden Sie eine andere Zahlungsmethode oder kontaktieren Sie uns.";
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    // Check environment variables
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET_KEY");
    
    console.log("Environment check:");
    console.log("- PAYPAL_CLIENT_ID exists:", !!PAYPAL_CLIENT_ID);
    console.log("- PAYPAL_SECRET_KEY exists:", !!PAYPAL_SECRET);
    console.log("- CLIENT_ID preview:", PAYPAL_CLIENT_ID?.substring(0, 20) + "...");
    
    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      const errorMsg = "PayPal credentials not configured in environment";
      console.error(errorMsg);
      return new Response(JSON.stringify({ error: errorMsg }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    // Determine environment (sandbox vs live)
    const isLive = !PAYPAL_CLIENT_ID.includes('sandbox') && PAYPAL_CLIENT_ID.startsWith('A');
    const baseUrl = isLive ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
    
    console.log("PayPal environment:", isLive ? "LIVE" : "SANDBOX");
    console.log("Base URL:", baseUrl);

    // Step 1: Get access token
    console.log("Step 1: Getting PayPal access token...");
    const authString = `${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`;
    const encodedAuth = base64Encode(new TextEncoder().encode(authString));
    
    const authResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Accept-Language": "en_US",
        "Authorization": `Basic ${encodedAuth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    });

    console.log("Auth response status:", authResponse.status);
    
    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal auth failed:", errorText);
      return new Response(JSON.stringify({ 
        error: `PayPal authentication failed: ${errorText}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;
    
    if (!accessToken) {
      console.error("No access token received");
      return new Response(JSON.stringify({ 
        error: "No access token received from PayPal" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("✓ Access token received");

    // Step 2: Create PayPal order
    console.log("Step 2: Creating PayPal order...");
    
    const { order_id, amount, currency, order_number, customer_email } = requestBody;
    
    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [{
        reference_id: order_number,
        amount: {
          currency_code: currency.toUpperCase(),
          value: amount.toFixed(2)
        },
        description: `AdN Parfümerie Bestellung ${order_number}`,
        custom_id: order_id
      }],
      application_context: {
        brand_name: "AdN Parfümerie",
        locale: "de-DE",
        user_action: "PAY_NOW",
        return_url: `https://8e9b04f2-784a-4e4d-aa8a-9a93b82040fa.sandbox.lovable.dev/checkout-success?paypal=true&order=${order_number}`,
        cancel_url: `https://8e9b04f2-784a-4e4d-aa8a-9a93b82040fa.sandbox.lovable.dev/checkout-cancel`
      }
    };

    console.log("Order payload:", JSON.stringify(orderPayload, null, 2));

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "PayPal-Request-Id": order_id
      },
      body: JSON.stringify(orderPayload)
    });

    console.log("Order response status:", orderResponse.status);

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("PayPal order creation failed:", errorText);
      return new Response(JSON.stringify({ 
        error: `PayPal order creation failed: ${errorText}` 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const orderData = await orderResponse.json();
    console.log("Order created with ID:", orderData.id);
    console.log("Order status:", orderData.status);
    console.log("Links available:", orderData.links?.map((l: any) => l.rel));

    // Find approval URL
    const approvalUrl = orderData.links?.find((link: any) => link.rel === "approve")?.href;

    if (!approvalUrl) {
      console.error("No approval URL found in PayPal response");
      return new Response(JSON.stringify({ 
        error: "PayPal approval URL not found" 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    console.log("✓ Approval URL found:", approvalUrl);

    const result = {
      paypal_order_id: orderData.id,
      approval_url: approvalUrl,
      status: orderData.status
    };

    console.log("=== SUCCESS - Returning result ===");
    console.log(result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("=== PAYPAL FUNCTION ERROR ===");
    console.error("Error type:", typeof error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error occurred in PayPal function",
      type: error.name || "UnknownError"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});