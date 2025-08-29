import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
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

interface PaymentRequest {
  items: CartItem[];
  guestEmail?: string;
  couponCode?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE PAYMENT SIMPLE FUNCTION START ===");
    
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY");
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    
    console.log("Environment check:", {
      supabaseUrl: supabaseUrl ? "✓ Set" : "✗ Missing",
      supabaseKey: supabaseKey ? "✓ Set" : "✗ Missing", 
      stripeKey: stripeKey ? "✓ Set" : "✗ Missing"
    });

    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY ist nicht konfiguriert");
    }

    const supabaseClient = createClient(
      supabaseUrl ?? "",
      supabaseKey ?? ""
    );

    const { items, guestEmail, couponCode }: PaymentRequest = await req.json();
    console.log("Request data:", { itemCount: items?.length, guestEmail, couponCode });

    if (!items || items.length === 0) {
      throw new Error("Keine Artikel im Warenkorb");
    }

    // Get user if authenticated
    let user = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    // Use user email or guest email
    const customerEmail = user?.email || guestEmail;
    console.log("Customer info:", { userEmail: user?.email, guestEmail, finalEmail: customerEmail });
    
    if (!customerEmail) {
      throw new Error("E-Mail-Adresse erforderlich");
    }

    console.log("Initializing Stripe...");
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate totals and create line items
    let subtotal = 0;
    const lineItems = items.map(item => {
      const itemTotal = item.variant.price * 100 * item.quantity; // Convert to cents
      subtotal += itemTotal;
      
      // Create absolute URL for image if it exists and is relative
      let productImages = [];
      if (item.perfume.image) {
        const imageUrl = item.perfume.image.startsWith('http') 
          ? item.perfume.image 
          : `${req.headers.get("origin")}${item.perfume.image}`;
        productImages = [imageUrl];
      }
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.perfume.brand} - ${item.variant.name}`,
            images: productImages, // Only include if we have a valid absolute URL
            metadata: {
              perfume_id: item.perfume.id,
              variant_id: item.variant.id,
            },
          },
          unit_amount: item.variant.price * 100, // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    console.log("Subtotal calculated:", subtotal);

    // Handle coupon discount
    let discountAmount = 0;
    let finalTotal = subtotal;
    
    if (couponCode) {
      console.log("Validating coupon:", couponCode);
      const { data: coupon, error: couponError } = await supabaseClient
        .from("coupons")
        .select("*")
        .eq("code", couponCode)
        .eq("active", true)
        .single();
      
      if (!couponError && coupon) {
        const now = new Date();
        const validFrom = coupon.valid_from ? new Date(coupon.valid_from) : null;
        const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;
        
        const isDateValid = (!validFrom || now >= validFrom) && (!validUntil || now <= validUntil);
        const isUsageValid = !coupon.max_uses || coupon.current_uses < coupon.max_uses;
        const isMinOrderValid = !coupon.min_order_amount || subtotal >= coupon.min_order_amount;
        
        if (isDateValid && isUsageValid && isMinOrderValid) {
          if (coupon.discount_type === "percentage") {
            discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
          } else if (coupon.discount_type === "fixed") {
            discountAmount = coupon.discount_value * 100; // Convert to cents
          }
          
          finalTotal = Math.max(0, subtotal - discountAmount);
          console.log("Coupon applied:", { discountAmount, finalTotal });
        } else {
          console.log("Coupon validation failed:", { isDateValid, isUsageValid, isMinOrderValid });
        }
      } else {
        console.log("Coupon not found or inactive");
      }
    }

    // Handle 0€ orders (Stripe doesn't allow 0 amount payments)
    if (finalTotal === 0) {
      console.log("0€ order detected, processing without Stripe...");
      
      // Save order directly to database as paid
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const orderData = {
        user_id: user?.id || null,
        stripe_session_id: null, // No Stripe session for free orders
        total_amount: 0,
        currency: "eur",
        status: "paid", // Mark as paid since it's free
        created_at: new Date().toISOString(),
      };

      console.log("Creating free order in database...");
      const { data: order, error: orderError } = await supabaseService
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error("Free order creation error:", orderError);
        throw new Error("Fehler beim Erstellen der kostenlosen Bestellung");
      }

      console.log("Free order created:", order.id);
      
      // Save order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        perfume_id: item.perfume.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: item.variant.price * 100,
        total_price: item.variant.price * 100 * item.quantity,
      }));

      const { error: itemsError } = await supabaseService.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Free order items creation error:", itemsError);
      }

      // Return success URL for free order
      return new Response(JSON.stringify({ 
        url: `${req.headers.get("origin")}/checkout/success?free_order=true&order_id=${order.id}`,
        free_order: true 
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Creating Stripe checkout session...");
    
    // Create Stripe checkout session with multiple payment methods
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
      payment_method_types: [
        'card',
        'sepa_debit', 
        'giropay',
        'sofort',
        'klarna',
        'paypal'
      ],
      shipping_address_collection: {
        allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'eur',
            },
            display_name: 'Kostenloser Versand (Deutschland)',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 2,
              },
              maximum: {
                unit: 'business_day',
                value: 5,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1599, // 15.99€ in cents
              currency: 'eur',
            },
            display_name: 'EU Versand',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 3,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
      metadata: {
        user_id: user?.id || 'guest',
        guest_email: guestEmail || '',
      },
      automatic_tax: {
        enabled: true,
      },
      phone_number_collection: {
        enabled: true,
      },
    });

    console.log("Stripe session created:", session.id);

    // Save order to database with simplified approach
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const orderData = {
      user_id: user?.id || null,
      stripe_session_id: session.id,
      total_amount: subtotal,
      currency: "eur",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    console.log("Saving order to database...");
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      // Continue without failing - we can process the order later
    } else {
      console.log("Order created:", order.id);
      
      // Save order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        perfume_id: item.perfume.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
        unit_price: item.variant.price * 100,
        total_price: item.variant.price * 100 * item.quantity,
      }));

      const { error: itemsError } = await supabaseService.from("order_items").insert(orderItems);
      if (itemsError) {
        console.error("Order items creation error:", itemsError);
      }
    }

    console.log("Returning checkout URL:", session.url);
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
    
  } catch (error) {
    console.error("=== PAYMENT ERROR ===");
    console.error("Error details:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
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