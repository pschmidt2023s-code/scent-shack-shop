import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== SIMPLE TEST START ===");
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("STRIPE_SECRET_KEY found:", !!stripeKey);
    
    if (!stripeKey) {
      console.log("No Stripe key - checking all env vars...");
      const allVars = Deno.env.toObject();
      console.log("Available env vars:", Object.keys(allVars));
      
      return new Response(JSON.stringify({
        error: "STRIPE_SECRET_KEY nicht verfügbar",
        availableKeys: Object.keys(allVars)
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Stripe key exists, length:", stripeKey.length);
    
    return new Response(JSON.stringify({
      success: true,
      message: "Stripe key is available",
      keyLength: stripeKey.length,
      startsWithSk: stripeKey.startsWith("sk_")
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },  
      status: 200,
    });
    
  } catch (error) {
    console.error("Test error:", error);
    return new Response(JSON.stringify({ 
      error: "Test failed",
      message: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});