import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { variantId, productName } = await req.json();
    
    console.log("Sending stock notifications for variant:", variantId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get all pending notifications for this variant
    const { data: notifications, error: fetchError } = await supabaseAdmin
      .from("stock_notifications")
      .select("*")
      .eq("variant_id", variantId)
      .eq("notified", false);

    if (fetchError) throw fetchError;

    if (!notifications || notifications.length === 0) {
      return new Response(
        JSON.stringify({ message: "No pending notifications" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send email to each subscriber (simplified - in production use email service)
    console.log(`Would send ${notifications.length} stock notifications for ${productName}`);

    // Mark as notified
    const { error: updateError } = await supabaseAdmin
      .from("stock_notifications")
      .update({ notified: true })
      .eq("variant_id", variantId)
      .eq("notified", false);

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        notified: notifications.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
