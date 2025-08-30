import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  perfume_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface OrderData {
  order_number: string;
  user_id?: string;
  guest_email?: string;
  total_amount: number;
  currency: string;
  payment_method: 'paypal' | 'paypal_me' | 'bank' | 'card';
  referral_code?: string;
  customer_data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  coupon_data?: {
    code: string;
    discount_amount: number;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== CREATE CUSTOM ORDER START ===");
    
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const orderData: OrderData = await req.json();
    console.log("Order data:", orderData);

      // Track referral if partner code exists
      let partnerId = null;
      if (orderData.referral_code) {
        const { data: partnerData, error: partnerError } = await supabaseService
          .from('partners')
          .select('id, commission_rate')
          .eq('partner_code', orderData.referral_code)
          .eq('status', 'approved')
          .single();

        if (!partnerError && partnerData) {
          partnerId = partnerData.id;
          console.log("Referral partner found:", partnerData);
        }
      }

      // Create the order record
      const { data: order, error: orderError } = await supabaseService
        .from("orders")
        .insert({
          order_number: orderData.order_number,
          user_id: orderData.user_id || null,
          total_amount: orderData.total_amount,
          currency: orderData.currency,
          customer_name: `${orderData.customer_data.firstName} ${orderData.customer_data.lastName}`,
          customer_email: orderData.customer_data.email,
          customer_phone: orderData.customer_data.phone || null,
          shipping_address_data: orderData.customer_data,
          billing_address_data: orderData.customer_data,
          status: orderData.payment_method === 'bank' ? 'pending_payment' : 'pending',
          notes: orderData.guest_email ? `Guest order: ${orderData.guest_email}` : null,
          admin_notes: JSON.stringify({
            payment_method: orderData.payment_method,
            customer_data: orderData.customer_data,
            coupon_data: orderData.coupon_data
          }),
          partner_id: partnerId
        })
        .select()
        .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      throw orderError;
    }

    console.log("Order created:", order);

    // Create order items
    const orderItemsData = orderData.items.map(item => ({
      order_id: order.id,
      perfume_id: item.perfume_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price
    }));

    const { error: itemsError } = await supabaseService
      .from("order_items")
      .insert(orderItemsData);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      throw itemsError;
    }

    console.log("Order items created");

    // Send order confirmation email
    try {
      const { error: emailError } = await supabaseService.functions.invoke('send-order-confirmation', {
        body: {
          orderId: order.id,
          customerEmail: orderData.customer_data.email,
          customerName: `${orderData.customer_data.firstName} ${orderData.customer_data.lastName}`
        }
      });

      if (emailError) {
        console.error('Error sending order confirmation email:', emailError);
      } else {
        console.log('Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }

    // Create partner commission if referral exists
    if (partnerId && orderData.total_amount > 0) {
      const { data: partnerData } = await supabaseService
        .from('partners')
        .select('commission_rate')
        .eq('id', partnerId)
        .single();

      if (partnerData) {
        const commissionAmount = partnerData.commission_rate;
        
        const { error: saleError } = await supabaseService
          .from('partner_sales')
          .insert({
            partner_id: partnerId,
            order_id: order.id,
            commission_amount: commissionAmount,
            status: 'pending'
          });

        if (saleError) {
          console.error("Partner sale tracking error:", saleError);
        } else {
          console.log("Partner commission tracked:", { partnerId, commissionAmount });
        }
      }
    }

    // Handle PayPal payment
    if (orderData.payment_method === 'paypal') {
      console.log("Creating PayPal payment...");
      
      try {
        const { data: paypalData, error: paypalError } = await supabaseService.functions.invoke(
          'create-paypal-payment',
          {
            body: {
              order_id: order.id,
              amount: orderData.total_amount, // Already in euros
              currency: orderData.currency.toUpperCase(),
              order_number: orderData.order_number,
              customer_email: orderData.customer_data.email
            }
          }
        );

        console.log("PayPal function response:", { paypalData, paypalError });

        if (paypalError) {
          console.error("PayPal payment error:", paypalError);
          throw paypalError;
        }

        if (!paypalData || !paypalData.approval_url) {
          console.error("PayPal data missing approval URL:", paypalData);
          throw new Error("PayPal approval URL not received");
        }

        console.log("PayPal payment created:", paypalData);
        
        return new Response(JSON.stringify({ 
          success: true,
          order_id: order.id,
          order_number: orderData.order_number,
          paypal_url: paypalData.approval_url
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });

      } catch (paypalError) {
        console.error("PayPal payment creation failed:", paypalError);
        throw paypalError;
      }
    }

    // For PayPal.me and bank transfer, just return success
    return new Response(JSON.stringify({ 
      success: true,
      order_id: order.id,
      order_number: orderData.order_number,
      payment_method: orderData.payment_method
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in create-custom-order:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "An error occurred while creating the order"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});