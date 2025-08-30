import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PartnerConfirmationRequest {
  email?: string;
  userId?: string;
  name: string;
  partnerCode: string;
  status: 'applied' | 'approved' | 'rejected';
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Partner confirmation email function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId, name, partnerCode, status }: PartnerConfirmationRequest = await req.json();
    
    let userEmail = email;

    // If userId is provided instead of email, get email from auth
    if (userId && !userEmail) {
      const supabaseService = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        { auth: { persistSession: false } }
      );

      const { data: authUser } = await supabaseService.auth.admin.getUserById(userId);
      userEmail = authUser?.user?.email;
    }

    if (!userEmail) {
      throw new Error('No email found for user');
    }
    
    console.log(`Sending partner ${status} email to: ${userEmail}`);

    let subject = "";
    let content = "";

    if (status === 'applied') {
      subject = "Partner-Bewerbung erfolgreich eingereicht";
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Partner-Bewerbung erhalten</h2>
            
            <p>Liebe/r ${name},</p>
            
            <p>vielen Dank für Ihre Partner-Bewerbung bei ALDENAIR! Wir haben Ihre Bewerbung erfolgreich erhalten und werden sie in den nächsten Tagen prüfen.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1a1a1a;">Bewerbungsdetails</h3>
              <p><strong>Partner-Code:</strong> ${partnerCode}</p>
              <p><strong>Status:</strong> In Prüfung</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #007bff;">Was passiert als Nächstes?</h4>
              <ul style="margin-bottom: 0;">
                <li>Wir prüfen Ihre Bewerbung sorgfältig</li>
                <li>Sie erhalten eine E-Mail mit der Entscheidung</li>
                <li>Bei Genehmigung erhalten Sie Zugang zu Ihrem Partner-Dashboard</li>
              </ul>
            </div>
            
            <p>Bei Fragen zu Ihrer Partner-Bewerbung können Sie uns jederzeit kontaktieren.</p>
            
            <p>Vielen Dank für Ihr Interesse an einer Partnerschaft mit ALDENAIR!</p>
            
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
    } else if (status === 'approved') {
      subject = "🎉 Ihre Partner-Bewerbung wurde genehmigt!";
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">🎉 Herzlich willkommen als Partner!</h2>
            
            <p>Liebe/r ${name},</p>
            
            <p>wir freuen uns, Ihnen mitteilen zu können, dass Ihre Partner-Bewerbung bei ALDENAIR genehmigt wurde! Sie sind ab sofort unser offizieller Partner.</p>
            
            <div style="background: #d4edda; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 30px 0;">
              <h3 style="margin-top: 0; color: #155724;">Ihr Partner-Account</h3>
              <p><strong>Partner-Code:</strong> ${partnerCode}</p>
              <p><strong>Status:</strong> Aktiv</p>
              <p><strong>Provision:</strong> 2,50€ pro Verkauf</p>
            </div>
            
            <div style="background: #e8f4fd; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; margin: 30px 0;">
              <h4 style="margin-top: 0; color: #007bff;">So geht es weiter:</h4>
              <ul style="margin-bottom: 0;">
                <li>Loggen Sie sich in Ihr Konto ein</li>
                <li>Besuchen Sie das Partner-Dashboard unter <a href="${Deno.env.get("SUPABASE_URL")?.replace('https://tqswuibgnkdvrfocwjou.supabase.co', window.location?.origin || 'https://ihr-shop.de')}/partner">/partner</a></li>
                <li>Kopieren Sie Ihren persönlichen Referral-Link</li>
                <li>Beginnen Sie mit dem Teilen und Verdienen!</li>
              </ul>
            </div>
            
            <p>Ihr persönlicher Referral-Link wird im Partner-Dashboard angezeigt. Teilen Sie diesen Link und erhalten Sie für jeden Verkauf eine Provision von 2,50€.</p>
            
            <p>Wir freuen uns auf eine erfolgreiche Partnerschaft!</p>
            
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
    } else if (status === 'rejected') {
      subject = "Update zu Ihrer Partner-Bewerbung";
      content = `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">ALDENAIR</h1>
            <p style="margin: 10px 0 0 0; color: #d4af37;">Premium Parfümerie</p>
          </div>
          
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #1a1a1a; margin-bottom: 20px;">Update zu Ihrer Partner-Bewerbung</h2>
            
            <p>Liebe/r ${name},</p>
            
            <p>vielen Dank für Ihr Interesse an einer Partnerschaft mit ALDENAIR. Nach sorgfältiger Prüfung Ihrer Bewerbung müssen wir Ihnen leider mitteilen, dass wir Ihre Bewerbung zu diesem Zeitpunkt nicht annehmen können.</p>
            
            <p>Diese Entscheidung bedeutet nicht, dass eine zukünftige Partnerschaft ausgeschlossen ist. Gerne können Sie sich zu einem späteren Zeitpunkt erneut bewerben.</p>
            
            <p>Wir bedanken uns für Ihr Interesse und wünschen Ihnen alles Gute.</p>
            
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
      to: [userEmail],
      subject: subject,
      html: content,
    });

    console.log("Partner email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Partner email sent successfully",
      emailId: emailResponse.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-partner-confirmation function:", error);
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