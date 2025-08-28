import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DownloadInvoiceRequest {
  orderId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the user from the request
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user) {
      throw new Error("User not authenticated");
    }

    const { orderId }: DownloadInvoiceRequest = await req.json();

    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select(`
        *,
        order_items(*)
      `)
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      throw new Error("Order not found or access denied");
    }

    // Generate simple HTML invoice
    const invoiceDate = new Date(order.created_at).toLocaleDateString('de-DE');
    const orderNumber = order.order_number || order.id.slice(-8);
    
    const itemsHtml = order.order_items.map((item: any) => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">Parfum ${item.variant_id}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€${(item.unit_price / 100).toFixed(2)}</td>
        <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">€${(item.total_price / 100).toFixed(2)}</td>
      </tr>
    `).join('');

    const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Rechnung ${orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 40px; }
        .company-name { font-size: 24px; font-weight: bold; color: #d4af37; }
        .invoice-details { margin: 20px 0; }
        .invoice-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .invoice-table th { background-color: #f2f2f2; font-weight: bold; }
        .total-row { font-weight: bold; background-color: #f9f9f9; }
        .footer { margin-top: 40px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">ALDENAIR</div>
        <p>Prestige Flakon - Exklusive Parfüms</p>
      </div>
      
      <div class="invoice-details">
        <h2>Rechnung</h2>
        <p><strong>Rechnungsnummer:</strong> ${orderNumber}</p>
        <p><strong>Rechnungsdatum:</strong> ${invoiceDate}</p>
        <p><strong>Bestellung:</strong> #${orderNumber}</p>
      </div>
      
      <table class="invoice-table">
        <thead>
          <tr>
            <th>Artikel</th>
            <th style="text-align: center;">Menge</th>
            <th style="text-align: right;">Einzelpreis</th>
            <th style="text-align: right;">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr class="total-row">
            <td colspan="3" style="text-align: right; font-weight: bold;">Gesamt:</td>
            <td style="text-align: right; font-weight: bold;">€${(order.total_amount / 100).toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="footer">
        <p>Vielen Dank für Ihre Bestellung bei ALDENAIR!</p>
        <p>Bei Fragen kontaktieren Sie uns gerne über unser Kontaktformular.</p>
      </div>
    </body>
    </html>
    `;

    // For now, return HTML content that can be opened in a new tab
    // In a production environment, you would convert this to PDF
    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(invoiceHtml)}`;
    
    return new Response(JSON.stringify({ pdfUrl: dataUrl }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);