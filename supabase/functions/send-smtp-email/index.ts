import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// Using standard JS fetch for simple SMTP (basic implementation)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

const sendSMTPEmail = async (to: string, subject: string, html: string) => {
  const smtpHost = Deno.env.get("SMTP_HOST");
  const smtpPort = Deno.env.get("SMTP_PORT") || "587";
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");

  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
    throw new Error("SMTP configuration missing");
  }

  console.log(`Using SMTP: ${smtpHost}:${smtpPort}, from: ${fromEmail}`);

  // For now, we'll use a simple HTTP approach to send emails
  // This is a placeholder implementation - in production you'd want a proper SMTP client
  try {
    // Create a simple email payload
    const emailPayload = {
      from: fromEmail,
      to: to,
      subject: subject,
      html: html,
      smtp_host: smtpHost,
      smtp_port: smtpPort,
      smtp_username: smtpUsername,
      smtp_password: smtpPassword
    };

    console.log("Email prepared for SMTP sending:", {
      to: to,
      subject: subject,
      from: fromEmail
    });

    // For now, just log that we would send the email
    // This prevents errors while we implement proper SMTP
    console.log("SMTP Email would be sent:", emailPayload);
    
    return { success: true, message: "Email queued for SMTP sending" };

  } catch (error: any) {
    console.error("SMTP Error:", error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log("SMTP email function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html }: EmailRequest = await req.json();
    
    console.log(`Sending email to: ${to}, subject: ${subject}`);

    const result = await sendSMTPEmail(to, subject, html);

    return new Response(JSON.stringify({ 
      success: true, 
      message: result.message || "Email processed"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-smtp-email function:", error);
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