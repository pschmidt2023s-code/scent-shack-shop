import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { userId, currentProductId, limit = 5 } = await req.json();
    
    console.log("Getting AI recommendations for user:", userId);

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user's browsing history
    const { data: views } = await supabaseAdmin
      .from("product_views")
      .select("product_id, variant_id")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(10);

    // Get user's favorites
    const { data: favorites } = await supabaseAdmin
      .from("favorites")
      .select("perfume_id")
      .eq("user_id", userId);

    // Get user's purchase history
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select("order_items(perfume_id)")
      .eq("user_id", userId)
      .eq("status", "paid");

    // Prepare context for AI
    const context = {
      viewedProducts: views?.map(v => v.product_id) || [],
      favoriteProducts: favorites?.map(f => f.perfume_id) || [],
      purchasedProducts: orders?.flatMap(o => o.order_items?.map((i: any) => i.perfume_id)) || [],
      currentProduct: currentProductId,
    };

    // Call OpenAI for recommendations
    const openAIKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAIKey) throw new Error("OPENAI_API_KEY not configured");

    const aiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAIKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Du bist ein Parfüm-Empfehlungsexperte. Basierend auf dem Kaufverhalten und den Vorlieben des Kunden, empfiehl passende Produkte.`
          },
          {
            role: "user",
            content: `Kunde hat angesehen: ${context.viewedProducts.join(", ")}. Favoriten: ${context.favoriteProducts.join(", ")}. Gekauft: ${context.purchasedProducts.join(", ")}. Aktuelles Produkt: ${context.currentProduct}. Empfehle ${limit} passende Produkte mit kurzer Begründung.`
          }
        ],
        max_tokens: 500,
      }),
    });

    const aiData = await aiResponse.json();
    const recommendation = aiData.choices[0].message.content;

    console.log("AI Recommendation:", recommendation);

    return new Response(
      JSON.stringify({ 
        recommendation,
        context,
        success: true 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
