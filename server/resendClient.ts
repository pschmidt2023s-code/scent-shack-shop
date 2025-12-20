// Resend email client using Replit Connection API
import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail: fromEmail || 'noreply@aldenair.de'
  };
}

export async function sendPasswordResetEmail(to: string, resetToken: string, baseUrl: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Passwort zurücksetzen - ALDENAIR',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d97706; font-size: 28px; margin: 0;">ALDENAIR</h1>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Passwort zurücksetzen</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen.
            </p>
            
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Passwort zurücksetzen
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Dieser Link ist 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ALDENAIR - Premium Parfums
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendOrderConfirmationEmail(to: string, orderNumber: string, orderTotal: number) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Bestellbestätigung ${orderNumber} - ALDENAIR`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 20px;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d97706; font-size: 28px; margin: 0;">ALDENAIR</h1>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Vielen Dank für Ihre Bestellung!</h2>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Ihre Bestellung <strong>${orderNumber}</strong> wurde erfolgreich aufgegeben.
            </p>
            
            <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #92400e; font-weight: 600;">Bestellsumme: ${orderTotal.toFixed(2)} EUR</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Wir werden Sie benachrichtigen, sobald Ihre Bestellung versandt wurde.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              ALDENAIR - Premium Parfums
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Failed to send order confirmation email:', error);
    return { success: false, error: error.message };
  }
}
