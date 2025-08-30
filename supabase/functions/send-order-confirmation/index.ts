import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderConfirmationRequest {
  orderId: string;
  customerEmail: string;
  customerName?: string;
}

interface OrderDetails {
  order_number: string;
  total_amount: number;
  currency: string;
  created_at: string;
  status: string;
  order_items?: Array<{
    perfume_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Order confirmation email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, customerEmail, customerName }: OrderConfirmationRequest = await req.json();
    
    console.log(`Processing order confirmation for order: ${orderId}, email: ${customerEmail}`);

    // Create Supabase client with service role key to access order data
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select(`
        order_number,
        total_amount,
        currency,
        created_at,
        status,
        order_items (
          perfume_id,
          variant_id,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error(`Order not found: ${orderId}`);
    }

    const orderDetails = order as OrderDetails;
    console.log(`Order details fetched: ${JSON.stringify(orderDetails)}`);

    // Format order date
    const orderDate = new Date(orderDetails.created_at).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Format total amount
    const totalAmount = (orderDetails.total_amount / 100).toFixed(2);
    const currency = orderDetails.currency.toUpperCase();

    // Generate order items HTML
    let orderItemsHtml = '';
    if (orderDetails.order_items && orderDetails.order_items.length > 0) {
      orderItemsHtml = orderDetails.order_items.map(item => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.perfume_id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.variant_id}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.unit_price / 100).toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">€${(item.total_price / 100).toFixed(2)}</td>
        </tr>
      `).join('');
    }

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "ALDENAIR <support@aldenairperfumes.de>",
      to: [customerEmail],
      subject: `Bestellbestätigung - ${orderDetails.order_number}`,
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Vielen Dank für Ihre Bestellung!</h2>
            
            <p>Liebe/r ${customerName || 'Kunde/Kundin'},</p>
            
            <p>wir haben Ihre Bestellung erfolgreich erhalten und bearbeiten sie bereits. Hier sind die Details Ihrer Bestellung:</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${orderDetails.order_number}</p>
              <p><strong>Bestelldatum:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> ${orderDetails.status === 'pending' ? 'In Bearbeitung' : orderDetails.status}</p>
              <p><strong>Gesamtbetrag:</strong> €${totalAmount}</p>
            </div>
            
            ${orderDetails.order_items && orderDetails.order_items.length > 0 ? `
              <h3 style="color: #1a1a1a;">Bestellte Artikel</h3>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Produkt</th>
                    <th style="padding: 12px; text-align: left; border-bottom: 2px solid #ddd;">Variante</th>
                    <th style="padding: 12px; text-align: center; border-bottom: 2px solid #ddd;">Menge</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Einzelpreis</th>
                    <th style="padding: 12px; text-align: right; border-bottom: 2px solid #ddd;">Gesamt</th>
                  </tr>
                </thead>
                <tbody>
                  ${orderItemsHtml}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="4" style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #1a1a1a;">Gesamtbetrag:</td>
                    <td style="padding: 15px; text-align: right; font-weight: bold; border-top: 2px solid #1a1a1a;">€${totalAmount}</td>
                  </tr>
                </tfoot>
              </table>
            ` : ''}
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #007bff;">Was passiert als Nächstes?</h4>
              <ul style="margin-bottom: 0;">
                <li>Wir verpacken Ihre Bestellung sorgfältig</li>
                <li>Sie erhalten eine Versandbestätigung mit Tracking-Nummer</li>
                <li>Ihre Parfüms werden in 2-3 Werktagen geliefert</li>
              </ul>
            </div>
            
            <p>Bei Fragen zu Ihrer Bestellung können Sie uns jederzeit kontaktieren. Verwenden Sie dabei bitte Ihre Bestellnummer <strong>${orderDetails.order_number}</strong>.</p>
            
            <p>Vielen Dank, dass Sie sich für ALDENAIR entschieden haben!</p>
            
            <p style="margin-top: 40px;">
              Mit freundlichen Grüßen<br>
              <strong>Ihr ALDENAIR Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>ALDENAIR - Premium Parfümerie</p>
            <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese E-Mail.</p>
          </div>
        </div>
      `,
    });

    console.log("Order confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Order confirmation email sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-order-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);