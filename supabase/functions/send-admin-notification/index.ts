import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AdminNotificationRequest {
  orderId: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount: number;
  currency: string;
  paymentMethod?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== ADMIN NOTIFICATION START ===");
    
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const { 
      orderId, 
      orderNumber, 
      customerName, 
      customerEmail, 
      totalAmount, 
      currency, 
      paymentMethod 
    }: AdminNotificationRequest = await req.json();

    console.log("Admin notification data:", { 
      orderId, 
      orderNumber, 
      customerName, 
      customerEmail, 
      totalAmount, 
      currency, 
      paymentMethod 
    });

    // Fetch order details including items
    const { data: order, error: orderError } = await supabaseService
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          total_price,
          perfume_id,
          variant_id
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError) {
      console.error("Error fetching order details:", orderError);
      throw orderError;
    }

    // Format order items for email
    let itemsHtml = '';
    if (order.order_items && order.order_items.length > 0) {
      itemsHtml = order.order_items.map((item: any) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.perfume_id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.variant_id}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${(item.unit_price / 100).toFixed(2)}€</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${(item.total_price / 100).toFixed(2)}€</td>
        </tr>
      `).join('');
    }

    // Format payment method
    const paymentMethodDisplay = paymentMethod || order.admin_notes?.payment_method || 'Unbekannt';
    
    // Format shipping address
    let shippingAddress = 'Nicht verfügbar';
    if (order.shipping_address_data) {
      const addr = order.shipping_address_data;
      shippingAddress = `
        ${addr.firstName || ''} ${addr.lastName || ''}<br>
        ${addr.street || ''}<br>
        ${addr.postalCode || ''} ${addr.city || ''}<br>
        ${addr.country || ''}
      `;
    }

    const emailSubject = `🛒 Neue Bestellung eingegangen: ${orderNumber}`;
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Neue Bestellung</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 800px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
            🛒 Neue Bestellung eingegangen
          </h1>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #1e40af;">Bestelldetails</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 150px;">Bestellnummer:</td>
                <td style="padding: 8px 0;">${orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Kunde:</td>
                <td style="padding: 8px 0;">${customerName || 'Gast'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">E-Mail:</td>
                <td style="padding: 8px 0;">${customerEmail || order.customer_email || 'Nicht verfügbar'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Telefon:</td>
                <td style="padding: 8px 0;">${order.customer_phone || 'Nicht verfügbar'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Gesamtbetrag:</td>
                <td style="padding: 8px 0; font-size: 18px; font-weight: bold; color: #059669;">
                  ${(totalAmount / 100).toFixed(2)}€
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Zahlungsmethode:</td>
                <td style="padding: 8px 0;">${paymentMethodDisplay}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Status:</td>
                <td style="padding: 8px 0;">${order.status}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Bestellzeit:</td>
                <td style="padding: 8px 0;">${new Date(order.created_at).toLocaleString('de-DE')}</td>
              </tr>
            </table>
          </div>

          <div style="background-color: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #1e40af;">📦 Bestellte Artikel</h3>
            ${itemsHtml ? `
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background-color: #e2e8f0;">
                    <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Parfum</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: left;">Variante</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: center;">Menge</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Einzelpreis</th>
                    <th style="padding: 10px; border: 1px solid #cbd5e1; text-align: right;">Gesamtpreis</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            ` : '<p>Keine Artikeldetails verfügbar</p>'}
          </div>

          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #92400e;">📍 Lieferadresse</h3>
            <div style="margin-top: 10px;">
              ${shippingAddress}
            </div>
          </div>

          ${order.notes ? `
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #dc2626;">📝 Notizen</h3>
            <p style="margin-bottom: 0;">${order.notes}</p>
          </div>
          ` : ''}

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>Diese E-Mail wurde automatisch generiert. Bitte loggen Sie sich in das Admin-Panel ein, um weitere Details zu sehen und die Bestellung zu bearbeiten.</p>
            <p style="font-size: 14px; margin-top: 20px;">
              💼 AutoParfum Admin System<br>
              📧 Benachrichtigung für: pschmidt2023s@gmail.com
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send admin notification email via SMTP function
    console.log("Sending admin notification email...");
    const { data: emailResult, error: emailError } = await supabaseService.functions.invoke(
      'send-smtp-email',
      {
        body: {
          to: 'pschmidt2023s@gmail.com',
          subject: emailSubject,
          html: emailContent,
          from: 'AutoParfum System <noreply@autoparfum.com>'
        }
      }
    );

    if (emailError) {
      console.error("Error sending admin notification email:", emailError);
      throw emailError;
    }

    console.log("Admin notification email sent successfully:", emailResult);

    return new Response(JSON.stringify({ 
      success: true,
      message: "Admin notification sent successfully",
      emailResult 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in send-admin-notification:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send admin notification"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
};

serve(handler);