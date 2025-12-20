// Resend email client - uses RESEND_API_KEY environment variable
import { Resend } from 'resend';

// Use onboarding@resend.dev for testing (only sends to account email)
// Change to 'ALDENAIR <noreply@aldenair.de>' once domain is fully verified
const DEFAULT_FROM_EMAIL = 'onboarding@resend.dev';

export async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    console.error('[Resend] RESEND_API_KEY not found in environment');
    throw new Error('RESEND_API_KEY not configured');
  }
  
  console.log('[Resend] Using API key from environment');
  
  return {
    client: new Resend(apiKey),
    fromEmail: DEFAULT_FROM_EMAIL
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

interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingCost: number;
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country?: string;
  };
  paymentMethod: string;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    console.log('[Resend] Attempting to send order confirmation email to:', data.customerEmail);
    const { client, fromEmail } = await getResendClient();
    console.log('[Resend] Using fromEmail:', fromEmail);
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${item.price.toFixed(2)} EUR</td>
      </tr>
    `).join('');

    const paymentMethodText = data.paymentMethod === 'card' ? 'Kreditkarte' : 
                              data.paymentMethod === 'bank' ? 'Banküberweisung (Vorkasse)' : data.paymentMethod;

    const bankTransferInfo = data.paymentMethod === 'bank' ? `
      <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <h3 style="margin: 0 0 12px 0; color: #92400e; font-size: 16px;">Bankverbindung für Überweisung</h3>
        <p style="margin: 4px 0; color: #78350f; font-size: 14px;"><strong>Empfänger:</strong> ALDENAIR</p>
        <p style="margin: 4px 0; color: #78350f; font-size: 14px;"><strong>Verwendungszweck:</strong> ${data.orderNumber}</p>
        <p style="margin: 8px 0 0 0; color: #92400e; font-size: 12px;">Die Bankdaten finden Sie in Ihrem Kundenkonto.</p>
      </div>
    ` : '';

    const result = await client.emails.send({
      from: fromEmail,
      to: [data.customerEmail],
      subject: `Bestellbestätigung ${data.orderNumber} - ALDENAIR`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8f9fa; margin: 0; padding: 40px 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="color: #d97706; font-size: 28px; margin: 0;">ALDENAIR</h1>
              <p style="color: #6b7280; margin: 8px 0 0 0;">Premium Parfums</p>
            </div>
            
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 8px;">Vielen Dank für Ihre Bestellung!</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Bestellnummer: <strong>${data.orderNumber}</strong></p>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 24px;">
              Hallo ${data.customerName},<br>
              wir haben Ihre Bestellung erhalten und werden sie schnellstmöglich bearbeiten.
            </p>

            <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">Bestellübersicht</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background: #f3f4f6;">
                  <th style="padding: 12px; text-align: left; font-size: 14px;">Artikel</th>
                  <th style="padding: 12px; text-align: center; font-size: 14px;">Menge</th>
                  <th style="padding: 12px; text-align: right; font-size: 14px;">Preis</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr>
                  <td colspan="2" style="padding: 12px; text-align: right; color: #6b7280;">Versand:</td>
                  <td style="padding: 12px; text-align: right;">${data.shippingCost > 0 ? data.shippingCost.toFixed(2) + ' EUR' : 'Kostenlos'}</td>
                </tr>
                <tr style="background: #fef3c7;">
                  <td colspan="2" style="padding: 12px; text-align: right;"><strong>Gesamtbetrag:</strong></td>
                  <td style="padding: 12px; text-align: right;"><strong style="color: #d97706;">${data.totalAmount.toFixed(2)} EUR</strong></td>
                </tr>
              </tbody>
            </table>

            <div style="display: flex; gap: 24px; margin: 24px 0;">
              <div style="flex: 1;">
                <h4 style="color: #1f2937; font-size: 14px; margin: 0 0 8px 0;">Lieferadresse</h4>
                <p style="color: #6b7280; font-size: 14px; margin: 0; line-height: 1.5;">
                  ${data.customerName}<br>
                  ${data.shippingAddress.street}<br>
                  ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                  ${data.shippingAddress.country || 'Deutschland'}
                </p>
              </div>
              <div style="flex: 1;">
                <h4 style="color: #1f2937; font-size: 14px; margin: 0 0 8px 0;">Zahlungsart</h4>
                <p style="color: #6b7280; font-size: 14px; margin: 0;">${paymentMethodText}</p>
              </div>
            </div>

            ${bankTransferInfo}
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              Wir werden Sie benachrichtigen, sobald Ihre Bestellung versandt wurde.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              Bei Fragen kontaktieren Sie uns unter info@aldenair.de<br>
              &copy; ${new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log('[Resend] API Response:', JSON.stringify(result, null, 2));
    
    if (result.error) {
      console.error('[Resend] API Error:', result.error);
      return false;
    }
    
    console.log(`[Resend] Order confirmation email sent successfully to ${data.customerEmail}, id: ${result.data?.id}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send order confirmation email:', error.message);
    console.error('[Resend] Full error:', JSON.stringify(error, null, 2));
    return false;
  }
}

export async function sendShippingNotificationEmail(
  customerEmail: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Versandbenachrichtigung - ${orderNumber}`,
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
            
            <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 16px;">Ihre Bestellung wurde versandt!</h2>
            
            <p style="color: #4b5563; line-height: 1.6;">
              Bestellnummer: <strong>${orderNumber}</strong>
            </p>
            ${trackingNumber ? `<p style="color: #4b5563; line-height: 1.6;">Sendungsnummer: <strong>${trackingNumber}</strong></p>` : ''}
            
            <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
              Ihre Bestellung ist auf dem Weg zu Ihnen. Die Lieferung erfolgt in der Regel innerhalb von 2-4 Werktagen.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              &copy; ${new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
            </p>
          </div>
        </body>
        </html>
      `
    });
    
    console.log(`Shipping notification email sent to ${customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('Failed to send shipping notification email:', error);
    return false;
  }
}
