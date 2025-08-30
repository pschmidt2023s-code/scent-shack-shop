import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderStatusUpdateRequest {
  orderId: string;
  newStatus: string;
  oldStatus: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Order status update email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId, newStatus, oldStatus }: OrderStatusUpdateRequest = await req.json();
    
    console.log(`Processing order status update for order: ${orderId}, from ${oldStatus} to ${newStatus}`);

    // Create Supabase client
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Fetch order details
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select('order_number, customer_email, customer_name, total_amount, currency')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error("Error fetching order:", orderError);
      throw new Error(`Order not found: ${orderId}`);
    }

    // Only send emails for meaningful status changes
    if (newStatus === oldStatus || !order.customer_email) {
      return new Response(JSON.stringify({ success: true, message: "No email needed" }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    let subject = "";
    let content = "";

    const statusLabels: Record<string, string> = {
      pending: 'In Bearbeitung',
      paid: 'Bezahlt',
      shipped: 'Versendet',
      delivered: 'Zugestellt',
      cancelled: 'Storniert'
    };

    if (newStatus === 'shipped') {
      subject = `📦 Ihre Bestellung ${order.order_number} wurde versendet`;
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">📦 Ihre Bestellung ist unterwegs!</h2>
            
            <p>Liebe/r ${order.customer_name || 'Kunde/Kundin'},</p>
            
            <p>wir freuen uns, Ihnen mitteilen zu können, dass Ihre Bestellung versendet wurde!</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Versanddetails</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Status:</strong> Versendet</p>
              <p><strong>Gesamtbetrag:</strong> €${(order.total_amount / 100).toFixed(2)}</p>
            </div>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #155724;">Zustellung</h4>
              <p>Ihre Parfüms sind auf dem Weg zu Ihnen und werden voraussichtlich in 2-3 Werktagen zugestellt.</p>
            </div>
            
            <p>Wir hoffen, Sie werden viel Freude an Ihren neuen Düften haben!</p>
            
            <p style="margin-top: 40px;">
              Mit freundlichen Grüßen<br>
              <strong>Ihr ALDENAIR Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>ALDENAIR - Premium Parfümerie</p>
            <p>Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie gerne auf diese E-Mail.</p>
          </div>
        </div>
      `;
    } else if (newStatus === 'delivered') {
      subject = `✅ Ihre Bestellung ${order.order_number} wurde zugestellt`;
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">✅ Bestellung erfolgreich zugestellt!</h2>
            
            <p>Liebe/r ${order.customer_name || 'Kunde/Kundin'},</p>
            
            <p>Ihre Bestellung wurde erfolgreich zugestellt! Wir hoffen, Sie sind mit Ihren neuen Parfüms zufrieden.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Status:</strong> Zugestellt</p>
              <p><strong>Gesamtbetrag:</strong> €${(order.total_amount / 100).toFixed(2)}</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #007bff;">Bewerten Sie Ihr Einkaufserlebnis</h4>
              <p>Teilen Sie Ihre Meinung zu den gekauften Produkten mit anderen Kunden und helfen Sie uns, unser Sortiment zu verbessern.</p>
            </div>
            
            <p>Bei Fragen oder Problemen mit Ihrer Bestellung stehen wir Ihnen gerne zur Verfügung.</p>
            
            <p>Vielen Dank für Ihr Vertrauen in ALDENAIR!</p>
            
            <p style="margin-top: 40px;">
              Mit freundlichen Grüßen<br>
              <strong>Ihr ALDENAIR Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>ALDENAIR - Premium Parfümerie</p>
            <p>Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie gerne auf diese E-Mail.</p>
          </div>
        </div>
      `;
    } else if (newStatus === 'cancelled') {
      subject = `Ihre Bestellung ${order.order_number} wurde storniert`;
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Bestellung storniert</h2>
            
            <p>Liebe/r ${order.customer_name || 'Kunde/Kundin'},</p>
            
            <p>Ihre Bestellung wurde storniert. Falls bereits eine Zahlung erfolgt ist, wird diese in den nächsten Werktagen erstattet.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Status:</strong> Storniert</p>
              <p><strong>Betrag:</strong> €${(order.total_amount / 100).toFixed(2)}</p>
            </div>
            
            <p>Bei Fragen zur Stornierung oder Erstattung können Sie uns jederzeit kontaktieren.</p>
            
            <p style="margin-top: 40px;">
              Mit freundlichen Grüßen<br>
              <strong>Ihr ALDENAIR Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>ALDENAIR - Premium Parfümerie</p>
            <p>Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie gerne auf diese E-Mail.</p>
          </div>
        </div>
      `;
    } else {
      // Generic status update
      subject = `Update zu Ihrer Bestellung ${order.order_number}`;
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Update zu Ihrer Bestellung</h2>
            
            <p>Liebe/r ${order.customer_name || 'Kunde/Kundin'},</p>
            
            <p>der Status Ihrer Bestellung hat sich geändert.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Bestelldetails</h3>
              <p><strong>Bestellnummer:</strong> ${order.order_number}</p>
              <p><strong>Neuer Status:</strong> ${statusLabels[newStatus] || newStatus}</p>
              <p><strong>Gesamtbetrag:</strong> €${(order.total_amount / 100).toFixed(2)}</p>
            </div>
            
            <p>Bei Fragen zu Ihrer Bestellung können Sie uns jederzeit kontaktieren.</p>
            
            <p style="margin-top: 40px;">
              Mit freundlichen Grüßen<br>
              <strong>Ihr ALDENAIR Team</strong>
            </p>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
            <p>ALDENAIR - Premium Parfümerie</p>
            <p>Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie gerne auf diese E-Mail.</p>
          </div>
        </div>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "ALDENAIR <noreply@resend.dev>",
      to: [order.customer_email],
      subject: subject,
      html: content,
    });

    console.log("Order status update email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Order status update email sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-order-status-update function:", error);
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