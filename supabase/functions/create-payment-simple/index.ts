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
    console.log("=== DEBUG: Environment Variables Test ===");
    
    // Get all environment variables
    const allEnvVars = Deno.env.toObject();
    const envKeys = Object.keys(allEnvVars);
    
    console.log("Total environment variables count:", envKeys.length);
    console.log("Environment variable keys:", envKeys);
    
    // Specifically check for Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    console.log("STRIPE_SECRET_KEY exists:", !!stripeKey);
    console.log("STRIPE_SECRET_KEY length:", stripeKey?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_:", stripeKey?.startsWith("sk_") || false);
    
    // Check other important keys
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("Environment summary:", {
      SUPABASE_URL: !!supabaseUrl,
      SUPABASE_ANON_KEY: !!supabaseKey,
      SUPABASE_SERVICE_ROLE_KEY: !!serviceKey,
      STRIPE_SECRET_KEY: !!stripeKey,
    });

    return new Response(JSON.stringify({
      success: true,
      message: "Environment variables debug completed",
      envVarCount: envKeys.length,
      hasStripeKey: !!stripeKey,
      stripeKeyLength: stripeKey?.length || 0,
      startsWithSk: stripeKey?.startsWith("sk_") || false,
      availableKeys: envKeys
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("Debug error:", error);
    return new Response(JSON.stringify({ 
      error: "Debug failed",
      details: error.message
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});