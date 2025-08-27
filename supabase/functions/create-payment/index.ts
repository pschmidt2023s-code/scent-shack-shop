
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

interface ShippingAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  country: string;
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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const { items, guestEmail, couponCode }: PaymentRequest = await req.json();

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
    if (!customerEmail) {
      throw new Error("E-Mail-Adresse erforderlich");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check for existing Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    // Calculate totals
    let subtotal = 0;
    const lineItems = items.map(item => {
      const itemTotal = item.variant.price * 100 * item.quantity; // Convert to cents
      subtotal += itemTotal;
      
      return {
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.perfume.brand} - ${item.variant.name}`,
            images: [item.perfume.image],
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

    // Apply coupon if provided
    let couponDiscount = 0;
    let validCoupon = null;
    if (couponCode) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: coupon } = await supabaseService
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase())
        .eq("active", true)
        .single();

      if (coupon && new Date() >= new Date(coupon.valid_from) && new Date() <= new Date(coupon.valid_until)) {
        if (!coupon.max_uses || coupon.current_uses < coupon.max_uses) {
          if (subtotal >= (coupon.min_order_amount * 100)) {
            validCoupon = coupon;
            if (coupon.discount_type === 'percentage') {
              couponDiscount = Math.round(subtotal * (coupon.discount_value / 100));
            } else {
              couponDiscount = coupon.discount_value * 100; // Convert to cents
            }
          }
        }
      }
    }

    // Add shipping costs (free for Germany, 15.99€ for EU)
    const shippingCost = 0; // Will be determined by Stripe based on shipping address

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : customerEmail,
      line_items: lineItems,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/checkout/cancel`,
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
              amount: 1599,
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
      discounts: validCoupon ? [{
        coupon: await stripe.coupons.create({
          amount_off: couponDiscount,
          currency: 'eur',
          duration: 'once',
          name: validCoupon.code,
        }).then(c => c.id),
      }] : undefined,
      metadata: {
        user_id: user?.id || 'guest',
        guest_email: guestEmail || '',
        coupon_code: validCoupon?.code || '',
        coupon_id: validCoupon?.id || '',
      },
      automatic_tax: {
        enabled: true,
      },
    });

    // Save order to database
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const orderData = {
      user_id: user?.id || null,
      stripe_session_id: session.id,
      total_amount: subtotal - couponDiscount,
      currency: "eur",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Save order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      perfume_id: item.perfume.id,
      variant_id: item.variant.id,
      quantity: item.quantity,
      unit_price: item.variant.price * 100,
      total_price: item.variant.price * 100 * item.quantity,
    }));

    await supabaseService.from("order_items").insert(orderItems);

    // Update coupon usage if used
    if (validCoupon) {
      await supabaseService
        .from("coupons")
        .update({ current_uses: validCoupon.current_uses + 1 })
        .eq("id", validCoupon.id);
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
