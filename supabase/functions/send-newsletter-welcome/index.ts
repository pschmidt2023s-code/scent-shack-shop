import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Enhanced input sanitization for edge functions
const sanitizeInput = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// Email validation
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterWelcomeRequest {
  email: string;
  preferences?: {
    product_updates?: boolean;
    promotions?: boolean;
    tips?: boolean;
  };
}

const sendNewsletterWelcome = async (email: string, preferences: any) => {
  try {
    const response = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-smtp-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
      },
      body: JSON.stringify({
        to: email,
        subject: "Willkommen bei ALDENAIR - Ihr 10% Rabattcode!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title>Willkommen bei ALDENAIR</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #D4AF37, #B8860B); color: white; text-align: center; padding: 30px; }
              .content { padding: 30px; background: #f9f9f9; }
              .discount-code { background: #D4AF37; color: white; font-size: 24px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .benefits { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Willkommen bei ALDENAIR!</h1>
                <p>Ihre Premium-Destination für exquisite Parfüms</p>
              </div>
              
              <div class="content">
                <h2>Vielen Dank für Ihre Newsletter-Anmeldung!</h2>
                <p>Wir freuen uns sehr, Sie in unserer exklusiven Community begrüßen zu dürfen.</p>
                
                <div class="discount-code">
                  Ihr 10% Rabattcode: <strong>WELCOME10</strong>
                </div>
                
                <p><strong>Gültig für Ihre erste Bestellung - einlösbar beim Checkout!</strong></p>
                
                <div class="benefits">
                  <h3>Das erwartet Sie:</h3>
                  <ul>
                    ${preferences?.product_updates ? '<li>✨ Exklusive Vorabinformationen zu neuen Düften</li>' : ''}
                    ${preferences?.promotions ? '<li>🎁 Spezielle Rabatte nur für Newsletter-Abonnenten</li>' : ''}
                    ${preferences?.tips ? '<li>💡 Experten-Tipps zur perfekten Duftauswahl</li>' : ''}
                    
                    <li>💎 Zugang zu limitierten Editionen</li>
                  </ul>
                </div>
                
                <p>Entdecken Sie jetzt unsere exquisite Parfüm-Kollektion und finden Sie Ihren perfekten Duft!</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://aldenair.de" style="background: #D4AF37; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Jetzt shoppen</a>
                </div>
              </div>
              
              <div class="footer">
                <p>© 2025 ALDENAIR. Alle Rechte vorbehalten.</p>
                <p>Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.</p>
                <p>Falls Sie sich abmelden möchten, kontaktieren Sie uns unter support@aldenairperfumes.de</p>
              </div>
            </div>
          </body>
          </html>
        `
      })
    });

    const result = await response.json();
    console.log("Newsletter welcome email sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending newsletter welcome email:", error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, preferences }: NewsletterWelcomeRequest = await req.json();

    // Sanitize and validate email
    const sanitizedEmail = sanitizeInput(email);
    if (!validateEmail(sanitizedEmail)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Sending newsletter welcome email to:", sanitizedEmail);

    const result = await sendNewsletterWelcome(sanitizedEmail, preferences);

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in newsletter welcome function:", error);
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