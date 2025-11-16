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

    // Get all available products with their details
    const { data: allProducts } = await supabaseAdmin
      .from("products")
      .select(`
        id,
        name,
        brand,
        category,
        size,
        image,
        product_variants(id, name, price, in_stock)
      `);

    // Get user's browsing history
    const { data: views } = await supabaseAdmin
      .from("product_views")
      .select("product_id")
      .eq("user_id", userId)
      .order("viewed_at", { ascending: false })
      .limit(20);

    // Get user's favorites
    const { data: favorites } = await supabaseAdmin
      .from("favorites")
      .select("perfume_id")
      .eq("user_id", userId);

    // Get user's purchase history with details
    const { data: orders } = await supabaseAdmin
      .from("orders")
      .select(`
        order_items(perfume_id, quantity)
      `)
      .eq("user_id", userId)
      .eq("status", "paid");

    const viewedIds = views?.map(v => v.product_id) || [];
    const favoriteIds = favorites?.map(f => f.perfume_id) || [];
    const purchasedIds = orders?.flatMap(o => o.order_items?.map((i: any) => i.perfume_id)) || [];

    // Get details of viewed/purchased/favorited products
    const relevantProducts = allProducts?.filter(p => 
      viewedIds.includes(p.id) || favoriteIds.includes(p.id) || purchasedIds.includes(p.id)
    ) || [];

    const productSummary = relevantProducts.map(p => 
      `${p.name} (${p.brand}, ${p.category}, ${p.size})`
    ).join(", ");

    // Call Lovable AI for intelligent recommendations
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) throw new Error("LOVABLE_API_KEY not configured");

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${lovableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Du bist ein intelligenter Parfüm- und Duft-Empfehlungsassistent. Analysiere das Kaufverhalten des Kunden und empfehle passende Produkte. 
            
            WICHTIG: Wenn ein Kunde z.B. 50ml Parfümflaschen kauft, könnte er auch an Autodüften interessiert sein. Wenn er frische Düfte mag, empfehle ähnliche Kategorien. Lerne aus den Mustern.
            
            Verfügbare Produktkategorien: Parfum, Autoduft, Raumduft, Duftkerze
            Verfügbare Größen: 3ml (Probe), 50ml, 100ml, 200ml, 400ml`
          },
          {
            role: "user",
            content: `Kundenverhalten:
            - Angesehene/Gekaufte Produkte: ${productSummary || "Noch keine"}
            - Anzahl Käufe: ${purchasedIds.length}
            - Favoriten: ${favoriteIds.length}
            
            Aktuell betrachtet: ${currentProductId ? allProducts?.find(p => p.id === currentProductId)?.name : "Startseite"}
            
            Empfehle ${limit} passende Produkt-IDs aus dieser Liste und erkläre warum. Berücksichtige Cross-Selling (z.B. wer Parfüm kauft könnte Autoduft wollen).
            
            Verfügbare Produkte: ${allProducts?.map(p => `ID: ${p.id}, Name: ${p.name}, Marke: ${p.brand}, Kategorie: ${p.category}, Größe: ${p.size}`).join(" | ")}
            
            Antworte im JSON-Format: {"productIds": ["id1", "id2"], "reason": "kurze Erklärung"}`
          }
        ],
        max_tokens: 800,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("Lovable AI error:", aiResponse.status, errorText);
      throw new Error(`Lovable AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    console.log("AI Response:", content);

    // Parse AI response
    let productIds: string[] = [];
    let reason = "KI-basierte Empfehlungen für dich";

    try {
      const parsed = JSON.parse(content);
      productIds = parsed.productIds || [];
      reason = parsed.reason || reason;
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback: recommend random products
      productIds = allProducts
        ?.filter(p => p.id !== currentProductId)
        ?.slice(0, limit)
        ?.map(p => p.id) || [];
    }

    // Build recommendation response
    const recommendations = productIds
      .map(id => {
        const product = allProducts?.find(p => p.id === id);
        if (!product || !product.product_variants?.length) return null;
        
        const variant = product.product_variants.find((v: any) => v.in_stock) || product.product_variants[0];
        
        return {
          id: product.id,
          name: product.name,
          brand: product.brand,
          image: product.image || '/placeholder.svg',
          price: variant.price,
          reason: `${product.category} - ${product.size}`,
        };
      })
      .filter(Boolean);

    return new Response(
      JSON.stringify({ 
        recommendations,
        reason,
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
