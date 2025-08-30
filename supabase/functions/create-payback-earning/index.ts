import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaybackRequest {
  orderId: string;
  userId: string;
  orderAmount: number;
  paybackPercentage?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { orderId, userId, orderAmount, paybackPercentage = 5.0 }: PaybackRequest = await req.json();
    
    console.log(`Creating payback earning for order: ${orderId}, user: ${userId}, amount: ${orderAmount}`);

    // Calculate payback amount (5% default)
    const paybackAmount = (orderAmount * paybackPercentage) / 100;

    // Create payback earning record
    const { data: paybackEarning, error: paybackError } = await supabaseService
      .from('payback_earnings')
      .insert({
        user_id: userId,
        order_id: orderId,
        amount: paybackAmount,
        percentage: paybackPercentage,
        status: 'pending'
      })
      .select()
      .single();

    if (paybackError) {
      console.error("Error creating payback earning:", paybackError);
      throw paybackError;
    }

    console.log("Payback earning created:", paybackEarning);

    return new Response(JSON.stringify({ 
      success: true,
      payback_earning: paybackEarning,
      message: `€${paybackAmount.toFixed(2)} Payback erstellt`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in create-payback-earning:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Ein Fehler ist beim Erstellen der Payback-Gutschrift aufgetreten"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});