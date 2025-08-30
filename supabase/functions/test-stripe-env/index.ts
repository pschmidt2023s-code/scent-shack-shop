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
    console.log("=== STRIPE ENV TEST START ===");
    console.log("Function started at:", new Date().toISOString());
    
    // Get ALL environment variables
    const allEnvVars = Deno.env.toObject();
    console.log("Total environment variables:", Object.keys(allEnvVars).length);
    
    // Filter for relevant keys
    const relevantKeys = Object.keys(allEnvVars).filter(key => 
      key.includes('STRIPE') || 
      key.includes('SUPABASE') ||
      key.includes('SECRET') ||
      key.includes('KEY')
    );
    
    console.log("Relevant environment keys found:", relevantKeys);
    
    // Check specific keys
    const stripeSecretKey = allEnvVars.STRIPE_SECRET_KEY || Deno.env.get("STRIPE_SECRET_KEY");
    const stripeWebhookSecret = allEnvVars.STRIPE_WEBHOOK_SECRET || Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = allEnvVars.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = allEnvVars.SUPABASE_ANON_KEY || Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = allEnvVars.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    console.log("=== DETAILED CHECK ===");
    console.log("STRIPE_SECRET_KEY exists:", !!stripeSecretKey);
    console.log("STRIPE_SECRET_KEY length:", stripeSecretKey?.length || 0);
    console.log("STRIPE_SECRET_KEY starts with sk_:", stripeSecretKey?.startsWith('sk_') || false);
    console.log("STRIPE_WEBHOOK_SECRET exists:", !!stripeWebhookSecret);
    console.log("SUPABASE_URL exists:", !!supabaseUrl);
    console.log("SUPABASE_ANON_KEY exists:", !!supabaseAnonKey);
    console.log("SUPABASE_SERVICE_ROLE_KEY exists:", !!supabaseServiceKey);
    
    // Create response object
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      environmentCheck: {
        totalEnvVars: Object.keys(allEnvVars).length,
        relevantKeys: relevantKeys,
        stripeSecretKey: {
          exists: !!stripeSecretKey,
          length: stripeSecretKey?.length || 0,
          startsWithSk: stripeSecretKey?.startsWith('sk_') || false,
          prefix: stripeSecretKey ? stripeSecretKey.substring(0, 12) + "..." : "NONE"
        },
        stripeWebhookSecret: {
          exists: !!stripeWebhookSecret,
          length: stripeWebhookSecret?.length || 0
        },
        supabaseUrl: {
          exists: !!supabaseUrl,
          value: supabaseUrl || "MISSING"
        },
        supabaseAnonKey: {
          exists: !!supabaseAnonKey,
          length: supabaseAnonKey?.length || 0
        },
        supabaseServiceKey: {
          exists: !!supabaseServiceKey,
          length: supabaseServiceKey?.length || 0
        }
      }
    };

    console.log("Response prepared:", JSON.stringify(response, null, 2));

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("=== ENV TEST ERROR ===");
    console.error("Error:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    return new Response(JSON.stringify({
      error: true,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});