import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReturnNotificationRequest {
  returnId?: string;
  orderId?: string;
  action?: 'approve' | 'reject';
  customerEmail?: string;
  orderNumber?: string;
  reason?: string;
  type: 'admin_action' | 'customer_submission';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { returnId, orderId, action, customerEmail, orderNumber, reason, type }: ReturnNotificationRequest = await req.json();

    // Create Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let customerEmailAddress: string;
    let actualOrderNumber: string;

    if (type === 'customer_submission') {
      // Handle customer return submission
      const { data: orderData, error: orderError } = await supabaseAdmin
        .from('orders')
        .select(`
          order_number,
          user_id
        `)
        .eq('id', orderId)
        .single();

      if (orderError || !orderData) {
        throw new Error('Order not found');
      }

      // Get user email
      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(orderData.user_id);
      
      if (userError || !userData.user?.email) {
        throw new Error('User email not found');
      }

      customerEmailAddress = userData.user.email;
      actualOrderNumber = orderData.order_number || orderId!.slice(-8);

      // Send customer submission confirmation
      const subject = `Retoure angemeldet - Bestellung ${actualOrderNumber}`;
      const htmlContent = `
        <h1>Ihre Retoure wurde angemeldet</h1>
        <p>Liebe/r Kunde/in,</p>
        <p>Ihre Retouren-Anfrage für die Bestellung <strong>${actualOrderNumber}</strong> wurde erfolgreich angemeldet.</p>
        
        <h2>Angaben zu Ihrer Retoure:</h2>
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>Grund:</strong> ${reason}
        </div>
        
        <h2>Wie geht es weiter?</h2>
        <p>Wir prüfen Ihre Anfrage und melden uns innerhalb von 1-2 Werktagen bei Ihnen zurück. Bei Genehmigung erhalten Sie ein kostenloses Retourenlabel per E-Mail.</p>
        
        <h2>Rückgabebedingungen:</h2>
        <ul>
          <li>Parfüms müssen ungeöffnet und in originalverpacktem Zustand sein</li>
          <li>Rückgabe innerhalb von 14 Tagen nach Erhalt</li>
          <li>Kostenlose Rückgabe mit unserem Retourenlabel</li>
        </ul>
        
        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        
        <p>Mit freundlichen Grüßen,<br>
        Ihr ALDENAIR Team</p>
      `;

      const emailResponse = await resend.emails.send({
        from: "ALDENAIR <support@aldenairperfumes.de>",
        to: [customerEmailAddress],
        subject: subject,
        html: htmlContent,
      });

      return new Response(JSON.stringify({ success: true, emailResponse }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }

    // Handle admin action (approve/reject)
    const { data: returnData, error: returnError } = await supabaseAdmin
      .from('returns')
      .select(`
        *,
        orders (
          order_number,
          user_id
        )
      `)
      .eq('id', returnId)
      .single();

    if (returnError || !returnData) {
      throw new Error('Return not found');
    }

    // Get user email
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(returnData.orders.user_id);
    
    if (userError || !userData.user?.email) {
      throw new Error('User email not found');
    }

    customerEmailAddress = userData.user.email;
    actualOrderNumber = orderNumber || returnData.orders.order_number || returnId!.slice(-8);

    let subject: string;
    let htmlContent: string;

    if (action === 'approve') {
      subject = `Retoure genehmigt - Bestellung ${actualOrderNumber}`;
      htmlContent = `
        <h1>Ihre Retoure wurde genehmigt</h1>
        <p>Liebe/r Kunde/in,</p>
        <p>Ihre Retouren-Anfrage für die Bestellung <strong>${actualOrderNumber}</strong> wurde genehmigt.</p>
        
        <h2>Nächste Schritte:</h2>
        <ol>
          <li>Verpacken Sie die Artikel sicher in der Originalverpackung</li>
          <li>Verwenden Sie das beiliegende Rücksendeetikett oder erstellen Sie ein neues</li>
          <li>Senden Sie das Paket an folgende Adresse:</li>
        </ol>
        
        <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
          <strong>ALDENAIR Parfums<br>
          Retouren-Abteilung<br>
          Musterstraße 123<br>
          12345 Berlin<br>
          Deutschland</strong>
        </div>
        
        ${reason ? `<h2>Zusätzliche Informationen:</h2><p>${reason}</p>` : ''}
        
        <p>Nach Erhalt und Prüfung der Ware erhalten Sie die Rückerstattung innerhalb von 5-7 Werktagen auf Ihr ursprüngliches Zahlungsmittel.</p>
        
        <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        
        <p>Mit freundlichen Grüßen,<br>
        Ihr ALDENAIR Team</p>
      `;
    } else {
      subject = `Retoure abgelehnt - Bestellung ${actualOrderNumber}`;
      htmlContent = `
        <h1>Ihre Retoure wurde abgelehnt</h1>
        <p>Liebe/r Kunde/in,</p>
        <p>Leider müssen wir Ihre Retouren-Anfrage für die Bestellung <strong>${actualOrderNumber}</strong> ablehnen.</p>
        
        <h2>Grund der Ablehnung:</h2>
        <div style="background-color: #ffebee; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #f44336;">
          ${reason || 'Keine weiteren Details verfügbar.'}
        </div>
        
        <p>Falls Sie Fragen zu dieser Entscheidung haben, kontaktieren Sie uns gerne unter support@aldenairperfumes.de oder telefonisch unter +49 (0) 123 456789.</p>
        
        <p>Mit freundlichen Grüßen,<br>
        Ihr ALDENAIR Team</p>
      `;
    }

    const emailResponse = await resend.emails.send({
      from: "ALDENAIR <support@aldenairperfumes.de>",
      to: [customerEmailAddress],
      subject: subject,
      html: htmlContent,
    });

    console.log("Return notification email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-return-notification function:", error);
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