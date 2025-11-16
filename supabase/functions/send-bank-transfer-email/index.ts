import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BankTransferEmailRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  totalAmount: number;
  bankDetails: {
    recipient: string;
    iban: string;
    bic: string;
    bank: string;
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("=== BANK TRANSFER EMAIL START ===");
    
    const { customerEmail, customerName, orderNumber, totalAmount, bankDetails }: BankTransferEmailRequest = await req.json();
    
    console.log("Sending email to:", customerEmail);
    console.log("Order number:", orderNumber);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .bank-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { color: #6b7280; }
            .detail-value { font-weight: 600; color: #111827; }
            .highlight { background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 28px;">✓ Bestellung erfolgreich</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Vielen Dank für Ihre Bestellung bei ALDENAIR</p>
            </div>
            
            <div class="content">
              <p>Hallo ${customerName},</p>
              
              <p>Ihre Bestellung wurde erfolgreich aufgegeben!</p>
              
              <div class="detail-row">
                <span class="detail-label">Bestellnummer:</span>
                <span class="detail-value">${orderNumber}</span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Gesamtbetrag:</span>
                <span class="detail-value">${totalAmount.toFixed(2)}€</span>
              </div>
              
              <div class="highlight">
                <strong>⚠️ Wichtig für die Überweisung:</strong>
                <p style="margin: 10px 0 0 0;">Bitte geben Sie unbedingt die <strong>Bestellnummer ${orderNumber}</strong> als Verwendungszweck an, damit wir Ihre Zahlung korrekt zuordnen können.</p>
              </div>
              
              <div class="bank-details">
                <h2 style="margin-top: 0; color: #667eea; font-size: 18px;">Überweisungsdaten</h2>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">Empfänger</div>
                  <div style="font-weight: 600; font-size: 16px; margin-top: 5px;">${bankDetails.recipient}</div>
                </div>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">IBAN</div>
                  <div style="font-weight: 600; font-size: 16px; margin-top: 5px; font-family: monospace;">${bankDetails.iban}</div>
                </div>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">BIC</div>
                  <div style="font-weight: 600; font-size: 16px; margin-top: 5px; font-family: monospace;">${bankDetails.bic}</div>
                </div>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">Bank</div>
                  <div style="font-weight: 600; font-size: 16px; margin-top: 5px;">${bankDetails.bank}</div>
                </div>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">Betrag</div>
                  <div style="font-weight: 600; font-size: 18px; margin-top: 5px; color: #667eea;">${totalAmount.toFixed(2)}€</div>
                </div>
                
                <div style="margin: 15px 0;">
                  <div style="color: #6b7280; font-size: 14px;">Verwendungszweck</div>
                  <div style="font-weight: 600; font-size: 16px; margin-top: 5px; background: #fef3c7; padding: 8px; border-radius: 4px;">${orderNumber}</div>
                </div>
              </div>
              
              <p>Nach Zahlungseingang versenden wir Ihre Bestellung umgehend.</p>
              
              <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
              
              <p>Mit freundlichen Grüßen<br>
              Ihr ALDENAIR Team</p>
              
              <div class="footer">
                <p>ALDENAIR - Premium Parfüms<br>
                Diese E-Mail wurde automatisch generiert.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "ALDENAIR <onboarding@resend.dev>",
      to: [customerEmail],
      subject: `Bestellung ${orderNumber} - Überweisungsdetails`,
      html: emailHtml,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailId: emailResponse.data?.id }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
