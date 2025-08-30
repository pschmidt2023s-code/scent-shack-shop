import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
  const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
  const smtpUsername = Deno.env.get("SMTP_USERNAME");
  const smtpPassword = Deno.env.get("SMTP_PASSWORD");
  const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");

  if (!smtpHost || !smtpUsername || !smtpPassword || !fromEmail) {
    throw new Error("SMTP configuration missing");
  }

  console.log(`Connecting to SMTP server: ${smtpHost}:${smtpPort}`);

  try {
    // Create connection to SMTP server
    const conn = await Deno.connect({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper function to send command and read response
    const sendCommand = async (command: string) => {
      console.log(`> ${command}`);
      await conn.write(encoder.encode(command + "\r\n"));
      
      const buffer = new Uint8Array(1024);
      const bytesRead = await conn.read(buffer);
      if (bytesRead) {
        const response = decoder.decode(buffer.slice(0, bytesRead));
        console.log(`< ${response.trim()}`);
        return response;
      }
      return "";
    };

    try {
      // Read server greeting
      const greeting = new Uint8Array(1024);
      const greetingBytes = await conn.read(greeting);
      if (greetingBytes) {
        console.log(`< ${decoder.decode(greeting.slice(0, greetingBytes)).trim()}`);
      }

      // Send EHLO
      await sendCommand(`EHLO ${smtpHost}`);

      // Send AUTH LOGIN
      await sendCommand("AUTH LOGIN");
      
      // Send username (base64 encoded)
      const usernameB64 = btoa(smtpUsername);
      await sendCommand(usernameB64);
      
      // Send password (base64 encoded)  
      const passwordB64 = btoa(smtpPassword);
      await sendCommand(passwordB64);

      // Send MAIL FROM
      await sendCommand(`MAIL FROM:<${fromEmail}>`);

      // Send RCPT TO
      await sendCommand(`RCPT TO:<${to}>`);

      // Send DATA
      await sendCommand("DATA");

      // Send email content
      const emailContent = [
        `From: ALDENAIR <${fromEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=utf-8",
        "",
        html,
        "."
      ].join("\r\n");

      await conn.write(encoder.encode(emailContent + "\r\n"));

      // Read final response
      const finalBuffer = new Uint8Array(1024);
      const finalBytesRead = await conn.read(finalBuffer);
      if (finalBytesRead) {
        const finalResponse = decoder.decode(finalBuffer.slice(0, finalBytesRead));
        console.log(`< ${finalResponse.trim()}`);
      }

      // Send QUIT
      await sendCommand("QUIT");

      console.log("Email sent successfully via SMTP");
      return { success: true, message: "Email sent successfully" };

    } finally {
      conn.close();
    }

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