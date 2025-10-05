import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContestConfirmationRequest {
  firstName: string;
  lastName: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firstName, lastName, email }: ContestConfirmationRequest = await req.json();

    console.log("Sending contest confirmation email to:", email);

    const emailResponse = await resend.emails.send({
      from: "AutoParfum Gewinnspiel <onboarding@resend.dev>",
      to: [email],
      subject: "Bestätigung Ihrer Gewinnspiel-Teilnahme",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Vielen Dank für Ihre Teilnahme!</h1>
            </div>
            <div class="content">
              <p>Hallo ${firstName} ${lastName},</p>
              
              <p>wir freuen uns, dass Sie am AutoParfum Gewinnspiel teilnehmen!</p>
              
              <p>Ihre Teilnahme wurde erfolgreich registriert. Wir wünschen Ihnen viel Glück!</p>
              
              <p><strong>Was passiert als Nächstes?</strong></p>
              <ul>
                <li>Ihre Daten wurden sicher gespeichert</li>
                <li>Sie nehmen automatisch an der Verlosung teil</li>
                <li>Bei Gewinn werden Sie per E-Mail benachrichtigt</li>
              </ul>
              
              <p>Vielen Dank für Ihr Vertrauen und viel Glück! 🍀</p>
              
              <p>Mit freundlichen Grüßen,<br>
              Ihr AutoParfum Team</p>
            </div>
            <div class="footer">
              <p>Diese E-Mail wurde automatisch generiert. Bitte nicht antworten.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Contest confirmation email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-contest-confirmation function:", error);
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
