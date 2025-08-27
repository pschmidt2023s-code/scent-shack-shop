
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  sessionId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sessionId }: InvoiceRequest = await req.json();
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get checkout session details
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'shipping_details'],
    });

    if (session.payment_status !== 'paid') {
      throw new Error('Payment not completed');
    }

    // Update order status
    const { data: order, error: orderError } = await supabaseService
      .from("orders")
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq("stripe_session_id", sessionId)
      .select()
      .single();

    if (orderError) throw orderError;

    // Get order items
    const { data: orderItems } = await supabaseService
      .from("order_items")
      .select("*")
      .eq("order_id", order.id);

    // Generate invoice HTML
    const invoiceDate = new Date().toLocaleDateString('de-DE');
    const invoiceNumber = `INV-${order.id.slice(-8).toUpperCase()}`;
    
    const customerEmail = session.customer_details?.email || session.metadata?.guest_email;
    const customerName = session.customer_details?.name || 'Kunde';
    
    const shippingAddress = session.shipping_details?.address;
    const addressString = shippingAddress ? 
      `${shippingAddress.line1}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}, ${shippingAddress.postal_code} ${shippingAddress.city}, ${shippingAddress.country}` : '';

    const itemsHtml = orderItems?.map(item => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.perfume_id} - ${item.variant_id}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€${(item.unit_price / 100).toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€${(item.total_price / 100).toFixed(2)}</td>
      </tr>
    `).join('') || '';

    const subtotal = session.amount_subtotal ? (session.amount_subtotal / 100) : 0;
    const shipping = session.shipping_cost?.amount_total ? (session.shipping_cost.amount_total / 100) : 0;
    const tax = session.total_details?.amount_tax ? (session.total_details.amount_tax / 100) : 0;
    const total = session.amount_total ? (session.amount_total / 100) : 0;

    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Rechnung ${invoiceNumber}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            .header { margin-bottom: 30px; }
            .company-info { float: left; }
            .invoice-info { float: right; text-align: right; }
            .customer-info { clear: both; margin: 30px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total-row { font-weight: bold; background-color: #f9f9f9; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="company-info">
                <h2>Aldenair</h2>
                <p>
                    BGM.-Scheller-Str. 14<br>
                    96215 Lichtenfels<br>
                    Deutschland<br>
                    E-Mail: support@aldenairperfumes.de
                </p>
            </div>
            <div class="invoice-info">
                <h2>Rechnung</h2>
                <p>
                    <strong>Rechnungsnummer:</strong> ${invoiceNumber}<br>
                    <strong>Rechnungsdatum:</strong> ${invoiceDate}<br>
                    <strong>Bestellnummer:</strong> ${order.id.slice(-8).toUpperCase()}
                </p>
            </div>
        </div>

        <div class="customer-info">
            <h3>Rechnungsadresse:</h3>
            <p>
                ${customerName}<br>
                ${addressString}
            </p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>Artikel</th>
                    <th>Menge</th>
                    <th>Einzelpreis</th>
                    <th>Gesamtpreis</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHtml}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="3"><strong>Zwischensumme:</strong></td>
                    <td style="text-align: right;"><strong>€${subtotal.toFixed(2)}</strong></td>
                </tr>
                ${shipping > 0 ? `
                <tr>
                    <td colspan="3"><strong>Versandkosten:</strong></td>
                    <td style="text-align: right;"><strong>€${shipping.toFixed(2)}</strong></td>
                </tr>
                ` : ''}
                ${tax > 0 ? `
                <tr>
                    <td colspan="3"><strong>MwSt. (19%):</strong></td>
                    <td style="text-align: right;"><strong>€${tax.toFixed(2)}</strong></td>
                </tr>
                ` : ''}
                <tr class="total-row">
                    <td colspan="3"><strong>Gesamtbetrag:</strong></td>
                    <td style="text-align: right;"><strong>€${total.toFixed(2)}</strong></td>
                </tr>
            </tfoot>
        </table>

        <div class="footer">
            <p>Vielen Dank für Ihren Einkauf bei Aldenair!</p>
            <p>
                <strong>Geschäftsführer:</strong> Patric-Maurice Schmidt<br>
                <strong>E-Mail:</strong> support@aldenairperfumes.de
            </p>
        </div>
    </body>
    </html>
    `;

    // Here you would typically use a service like Resend to send the email
    // For now, we'll just return success
    console.log(`Invoice generated for order ${order.id}`);
    console.log(`Customer email: ${customerEmail}`);

    return new Response(JSON.stringify({ 
      success: true, 
      invoiceNumber,
      orderId: order.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Invoice error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
