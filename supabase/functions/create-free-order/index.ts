import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CartItem {
  perfume: {
    id: string;
    name: string;
    brand: string;
    image: string;
  };
  variant: {
    id: string;
    number: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface FreeOrderRequest {
  items: CartItem[];
  couponCode: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== FREE ORDER FUNCTION START ===");
    
    // Create Supabase client using anon key for auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    console.log("Parsing request...");
    const { items, couponCode }: FreeOrderRequest = await req.json();
    console.log("Free order request:", { itemCount: items?.length, couponCode });

    if (!items || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    // Get authenticated user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authentifizierung erforderlich für kostenlose Bestellungen");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      console.error("Auth error:", userError);
      throw new Error("Ungültiger Benutzer");
    }

    const user = userData.user;
    console.log("User authenticated:", user.id);

    // Validate coupon if provided
    if (couponCode) {
      console.log("Validating coupon:", couponCode);
      const { data: coupon, error: couponError } = await supabaseClient
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("active", true)
        .maybeSingle();
      
      if (couponError) {
        console.error("Coupon query error:", couponError);
        throw new Error("Fehler beim Validieren des Coupons");
      }
      
      if (!coupon) {
        throw new Error("Ungültiger Coupon-Code");
      }

      console.log("Coupon validated:", coupon.code);
    }

    // Create free order
    const orderData = {
      user_id: user.id,
      stripe_session_id: null,
      total_amount: 0,
      currency: "eur",
      status: "paid",
      created_at: new Date().toISOString(),
    };

    console.log("Creating free order...");
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .insert(orderData)
      .select()
      .maybeSingle();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw new Error(`Bestellfehler: ${orderError.message}`);
    }

    if (!order) {
      throw new Error("Bestellung konnte nicht erstellt werden");
    }

    console.log("Free order created:", order.id);

    // Create order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      perfume_id: item.perfume.id,
      variant_id: item.variant.id,
      quantity: item.quantity,
      unit_price: 0, // Free items
      total_price: 0,
    }));

    console.log("Creating order items...");
    const { error: itemsError } = await supabaseClient
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Don't fail completely for items error in free orders
    } else {
      console.log("Order items created successfully");
    }

    console.log("=== FREE ORDER FUNCTION SUCCESS ===");
    
    return new Response(JSON.stringify({ 
      success: true,
      order_id: order.id,
      url: `${req.headers.get("origin")}/checkout/success?free_order=true&order_id=${order.id}`
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("=== FREE ORDER ERROR ===");
    console.error("Error details:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.stack : String(error)
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});