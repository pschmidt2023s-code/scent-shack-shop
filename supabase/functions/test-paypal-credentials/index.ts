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
    console.log("=== TESTING PAYPAL CREDENTIALS ===");
    
    // Check all environment variables
    const allEnvVars = Deno.env.toObject();
    console.log("All environment variables:", Object.keys(allEnvVars));
    
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET_KEY");
    
    console.log("PAYPAL_CLIENT_ID exists:", !!PAYPAL_CLIENT_ID);
    console.log("PAYPAL_SECRET_KEY exists:", !!PAYPAL_SECRET);
    
    if (PAYPAL_CLIENT_ID) {
      console.log("CLIENT_ID length:", PAYPAL_CLIENT_ID.length);
      console.log("CLIENT_ID starts with:", PAYPAL_CLIENT_ID.substring(0, 5));
      console.log("CLIENT_ID ends with:", PAYPAL_CLIENT_ID.substring(PAYPAL_CLIENT_ID.length - 5));
    }
    
    if (PAYPAL_SECRET) {
      console.log("SECRET length:", PAYPAL_SECRET.length);
      console.log("SECRET starts with:", PAYPAL_SECRET.substring(0, 5));
    }
    
    const result = {
      client_id_exists: !!PAYPAL_CLIENT_ID,
      secret_exists: !!PAYPAL_SECRET,
      client_id_length: PAYPAL_CLIENT_ID?.length || 0,
      secret_length: PAYPAL_SECRET?.length || 0,
      env_vars_count: Object.keys(allEnvVars).length
    };
    
    return new Response(JSON.stringify(result, null, 2), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Test error:", error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});