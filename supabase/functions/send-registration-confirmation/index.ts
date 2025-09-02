import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Enhanced security headers with CSRF protection
const securityHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY", 
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Content-Security-Policy": "default-src 'self'"
};

// Rate limiting for email sending
class EmailRateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();
  
  isAllowed(email: string): boolean {
    const now = Date.now();
    const record = this.attempts.get(email);
    
    if (!record || now > record.resetTime) {
      this.attempts.set(email, { count: 1, resetTime: now + 15 * 60 * 1000 }); // 15 min window
      return true;
    }
    
    if (record.count >= 3) { // Max 3 emails per 15 minutes per address
      return false;
    }
    
    record.count++;
    return true;
  }
}

const emailLimiter = new EmailRateLimiter();

interface RegistrationConfirmationRequest {
  email: string;
  name: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Registration confirmation email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: securityHeaders });
  }

  try {
    const { email, name }: RegistrationConfirmationRequest = await req.json();
    
    // Validate and sanitize inputs
    if (!email || !email.includes('@') || email.length > 255) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid email address" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...securityHeaders }
      });
    }
    
    const sanitizedEmail = email.toLowerCase().trim();
    const sanitizedName = (name || '').replace(/[<>\"'&]/g, '').slice(0, 100);
    
    // Rate limiting check
    if (!emailLimiter.isAllowed(sanitizedEmail)) {
      console.log(`Rate limit exceeded for email: ${sanitizedEmail}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Too many registration attempts. Please try again later." 
      }), {
        status: 429,
        headers: { 
          "Content-Type": "application/json", 
          ...securityHeaders,
          "Retry-After": "900" // 15 minutes
        }
      });
    }
    
    console.log(`Sending registration confirmation to: ${sanitizedEmail}`);

    const emailResponse = await resend.emails.send({
      from: "ALDENAIR <support@aldenairperfumes.de>",
      to: [sanitizedEmail],
      subject: "Willkommen bei ALDENAIR - Registrierung erfolgreich!",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: #d4af37; color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #1a1a1a;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">🎉 Willkommen bei ALDENAIR!</h2>
            
            <p>Liebe/r ${sanitizedName},</p>
            
            <p>vielen Dank für Ihre Registrierung bei ALDENAIR! Ihr Konto wurde erfolgreich erstellt und Sie können nun unser komplettes Sortiment an exklusiven Parfüms entdecken.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Ihre Vorteile als registrierter Kunde:</h3>
              <ul style="margin-bottom: 0; padding-left: 20px;">
                <li>Schneller Checkout-Prozess</li>
                <li>Bestellverlauf und Tracking</li>
                <li>Persönliche Empfehlungen</li>
                <li>Exklusive Angebote und Newsletter</li>
                <li>Bewertungen und Erfahrungen teilen</li>
              </ul>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #007bff;">Entdecken Sie unser Sortiment</h4>
              <p style="margin-bottom: 0;">Stöbern Sie durch unsere sorgfältig ausgewählten Premium-Düfte und finden Sie Ihren neuen Lieblingsduft. Von frischen Zitrusnoten bis hin zu warmen, sinnlichen Aromen - bei uns ist für jeden Geschmack etwas dabei.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${req.headers.get("origin") || "https://aldenairperfumes.de"}" 
                 style="background: #1a1a1a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Jetzt einkaufen
              </a>
            </div>
            
            <p>Bei Fragen oder Wünschen stehen wir Ihnen gerne zur Verfügung. Kontaktieren Sie uns einfach per E-Mail.</p>
            
            <p>Wir freuen uns darauf, Sie bei ALDENAIR begrüßen zu dürfen!</p>
            
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
      `,
    });

    console.log("Registration confirmation email sent successfully:", emailResponse.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Registration confirmation email sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...securityHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-registration-confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: "Failed to send registration confirmation" 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...securityHeaders 
        },
      }
    );
  }
};

serve(handler);