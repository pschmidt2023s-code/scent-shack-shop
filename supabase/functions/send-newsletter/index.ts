import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsletterRequest {
  subject: string;
  content: string;
  subscribers: string[];
}

const handler = async (req: Request): Promise<Response> => {
  console.log("Newsletter send function called");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseService = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Verify admin authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabaseService.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: userRole } = await supabaseService
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!userRole || userRole.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { subject, content, subscribers }: NewsletterRequest = await req.json();
    
    console.log(`Sending newsletter to ${subscribers.length} subscribers`);

    // Create newsletter record
    const { data: newsletter, error: newsletterError } = await supabaseService
      .from('newsletters')
      .insert({
        subject,
        content,
        status: 'sending',
        sent_to_count: subscribers.length
      })
      .select()
      .single();

    if (newsletterError) {
      throw newsletterError;
    }

    // Create HTML content
    const htmlContent = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="background: #d4af37; color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 32px; font-weight: bold; color: #1a1a1a;">ALDENAIR</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">Premium Parfümerie</p>
        </div>
        
        <div style="padding: 30px; background: #fff;">
          <h2 style="color: #1a1a1a; margin-bottom: 20px;">${subject}</h2>
          <div style="white-space: pre-line;">${content}</div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          <p>ALDENAIR - Premium Parfümerie</p>
          <p>Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.</p>
          <p style="margin-top: 10px;">
            <a href="#" style="color: #666; text-decoration: underline;">Abmelden</a>
          </p>
        </div>
      </div>
    `;

    // Send newsletter in batches to avoid rate limits
    const batchSize = 50;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "ALDENAIR Newsletter <newsletter@aldenairperfumes.de>",
          to: batch,
          subject: subject,
          html: htmlContent,
        });

        console.log(`Newsletter batch ${Math.floor(i/batchSize) + 1} sent successfully:`, emailResponse);
        successCount += batch.length;
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`Error sending newsletter batch ${Math.floor(i/batchSize) + 1}:`, error);
        failCount += batch.length;
      }
    }

    // Update newsletter status
    const finalStatus = failCount === 0 ? 'sent' : (successCount === 0 ? 'failed' : 'partially_sent');
    
    const { error: updateError } = await supabaseService
      .from('newsletters')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        sent_to_count: successCount
      })
      .eq('id', newsletter.id);

    if (updateError) {
      console.error('Error updating newsletter status:', updateError);
    }

    console.log(`Newsletter completed: ${successCount} sent, ${failCount} failed`);

    return new Response(JSON.stringify({ 
      success: true,
      message: `Newsletter erfolgreich versendet`,
      sent_count: successCount,
      failed_count: failCount,
      newsletter_id: newsletter.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-newsletter function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Ein Fehler ist beim Versenden des Newsletters aufgetreten"
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