// Resend email client - uses RESEND_API_KEY environment variable
import { Resend } from 'resend';

const DEFAULT_FROM_EMAIL = 'ALDENAIR <noreply@aldenairperfumes.de>';

// Professional email template - NO emojis, clean business design
function emailWrapper(content: string, preheader?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="x-apple-disable-message-reformatting">
      <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
      <title>ALDENAIR</title>
      ${preheader ? `<span style="display:none;font-size:1px;color:#fafafa;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}</span>` : ''}
      <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
      <![endif]-->
    </head>
    <body style="margin:0;padding:0;background-color:#fafafa;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fafafa;">
        <tr>
          <td style="padding:32px 16px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:580px;margin:0 auto;background-color:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
              <!-- Header -->
              <tr>
                <td style="background-color:#1a1a1a;border-radius:8px 8px 0 0;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:3px;font-family:Arial,Helvetica,sans-serif;">ALDENAIR</h1>
                  <p style="margin:6px 0 0 0;color:#b8860b;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-family:Arial,Helvetica,sans-serif;">Exklusive Parfums</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="padding:36px 32px;background-color:#ffffff;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding:24px 32px;background-color:#f8f8f8;border-top:1px solid #e5e5e5;border-radius:0 0 8px 8px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                      <td style="text-align:center;">
                        <p style="margin:0 0 12px 0;color:#666666;font-size:13px;font-family:Arial,Helvetica,sans-serif;">
                          <a href="https://aldenair.de" style="color:#b8860b;text-decoration:none;">Website</a>
                          &nbsp;&nbsp;|&nbsp;&nbsp;
                          <a href="https://aldenair.de/contact" style="color:#b8860b;text-decoration:none;">Kontakt</a>
                          &nbsp;&nbsp;|&nbsp;&nbsp;
                          <a href="https://aldenair.de/datenschutz" style="color:#b8860b;text-decoration:none;">Datenschutz</a>
                        </p>
                        <p style="margin:0;color:#888888;font-size:12px;line-height:1.5;font-family:Arial,Helvetica,sans-serif;">
                          ALDENAIR<br>
                          E-Mail: info@aldenair.de
                        </p>
                        <p style="margin:16px 0 0 0;color:#aaaaaa;font-size:11px;font-family:Arial,Helvetica,sans-serif;">
                          Diese E-Mail wurde automatisch generiert. Bei Fragen antworten Sie bitte nicht auf diese E-Mail, sondern kontaktieren Sie uns unter info@aldenair.de
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

// Professional button component - no gradients for better compatibility
function emailButton(text: string, href: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const styles = variant === 'primary' 
    ? 'background-color:#1a1a1a;color:#ffffff;'
    : 'background-color:#ffffff;color:#1a1a1a;border:1px solid #d1d1d1;';
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
      <tr>
        <td style="${styles}padding:14px 32px;border-radius:6px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
          <a href="${href}" style="color:inherit;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Professional info box component
function infoBox(content: string, variant: 'warning' | 'success' | 'info' = 'info'): string {
  const colors = {
    warning: { bg: '#fffbeb', border: '#d97706' },
    success: { bg: '#f0fdf4', border: '#22c55e' },
    info: { bg: '#f0f9ff', border: '#0284c7' }
  };
  const c = colors[variant];
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:20px 0;">
      <tr>
        <td style="background-color:${c.bg};border-left:3px solid ${c.border};padding:16px 20px;border-radius:0 6px 6px 0;">
          ${content}
        </td>
      </tr>
    </table>
  `;
}

// Resend Integration - Uses Replit Connector for credentials
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
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email || DEFAULT_FROM_EMAIL
  };
}

// WARNING: Never cache this client.
// Always call this function again to get a fresh client.
export async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

// ============================================
// 1. PASSWORD RESET EMAIL
// ============================================
export async function sendPasswordResetEmail(to: string, resetToken: string, baseUrl: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Passwort zurücksetzen</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag,<br><br>
        Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen.
      </p>
      
      <div style="text-align:center;margin:32px 0;">
        ${emailButton('Passwort zurücksetzen', resetLink)}
      </div>
      
      ${infoBox(`
        <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
          <strong>Wichtig:</strong> Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
        </p>
      `, 'warning')}
      
      <p style="color:#888888;font-size:12px;text-align:center;margin-top:24px;font-family:Arial,Helvetica,sans-serif;">
        Link funktioniert nicht? Kopieren Sie diese URL:<br>
        <span style="color:#1a1a1a;word-break:break-all;">${resetLink}</span>
      </p>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Passwort zurücksetzen - ALDENAIR',
      html: emailWrapper(content, 'Setzen Sie Ihr ALDENAIR Passwort zurück')
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('[Resend] Failed to send password reset email:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 2. ORDER CONFIRMATION EMAIL
// ============================================
interface OrderEmailData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number; }>;
  totalAmount: number;
  shippingCost: number;
  shippingAddress: { street: string; city: string; postalCode: string; country?: string; };
  paymentMethod: string;
  bankSettings?: { recipient: string; iban: string; bic?: string; bankName?: string; };
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    console.log('[Resend] Attempting to send order confirmation email to:', data.customerEmail);
    const { client, fromEmail } = await getResendClient();
    
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6;">
          <p style="margin: 0; color: #171717; font-size: 15px; font-weight: 500;">${item.name}</p>
          <p style="margin: 4px 0 0 0; color: #737373; font-size: 13px;">Menge: ${item.quantity}</p>
        </td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f3f4f6; text-align: right; vertical-align: top;">
          <p style="margin: 0; color: #171717; font-size: 15px; font-weight: 600;">${item.price.toFixed(2)} EUR</p>
        </td>
      </tr>
    `).join('');

    const paymentMethodText = data.paymentMethod === 'card' ? 'Kreditkarte' : 
                              (data.paymentMethod === 'bank' || data.paymentMethod === 'bank_transfer') ? 'Banküberweisung' : 
                              data.paymentMethod === 'paypal' ? 'PayPal' : data.paymentMethod;

    const bankTransferInfo = (data.paymentMethod === 'bank' || data.paymentMethod === 'bank_transfer') && data.bankSettings ? infoBox(`
      <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 15px; font-weight: 600;">Zahlungsinformationen</h4>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        <strong>Empfänger:</strong> ${data.bankSettings.recipient}<br>
        <strong>IBAN:</strong> ${data.bankSettings.iban}<br>
        ${data.bankSettings.bic ? `<strong>BIC:</strong> ${data.bankSettings.bic}<br>` : ''}
        ${data.bankSettings.bankName ? `<strong>Bank:</strong> ${data.bankSettings.bankName}<br>` : ''}
        <strong>Verwendungszweck:</strong> ${data.orderNumber}
      </p>
    `, 'warning') : '';

    const content = `
      <h2 style="margin:0 0 8px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Vielen Dank für Ihre Bestellung</h2>
      <p style="margin:0 0 24px 0;color:#666666;font-size:14px;text-align:center;font-family:Arial,Helvetica,sans-serif;">Bestellnummer: <strong style="color:#1a1a1a;">${data.orderNumber}</strong></p>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 32px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${data.customerName},<br><br>
        wir haben Ihre Bestellung erhalten und werden sie schnellstmöglich bearbeiten. Sie erhalten eine weitere E-Mail, sobald Ihre Bestellung versandt wurde.
      </p>
      
      <!-- Order Items -->
      <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 16px 0; color: #171717; font-size: 16px; font-weight: 600;">Bestellübersicht</h3>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          ${itemsHtml}
          <tr>
            <td style="padding: 12px 0 0 0; color: #737373; font-size: 14px;">Versand</td>
            <td style="padding: 12px 0 0 0; text-align: right; color: #171717; font-size: 14px;">${data.shippingCost > 0 ? data.shippingCost.toFixed(2) + ' EUR' : 'Kostenlos'}</td>
          </tr>
          <tr>
            <td style="padding: 16px 0 0 0; border-top: 2px solid #e5e7eb; margin-top: 12px;">
              <p style="margin: 0; color: #171717; font-size: 16px; font-weight: 700;">Gesamtbetrag</p>
            </td>
            <td style="padding: 16px 0 0 0; border-top: 2px solid #e5e7eb; text-align: right;">
              <p style="margin: 0; color: #d97706; font-size: 20px; font-weight: 700;">${data.totalAmount.toFixed(2)} EUR</p>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Shipping & Payment Info -->
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 12px;">
            <div style="background: #fafafa; border-radius: 12px; padding: 20px; height: 100%;">
              <h4 style="margin: 0 0 12px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Lieferadresse</h4>
              <p style="margin: 0; color: #171717; font-size: 14px; line-height: 1.6;">
                ${data.customerName}<br>
                ${data.shippingAddress.street}<br>
                ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
                ${data.shippingAddress.country || 'Deutschland'}
              </p>
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 12px;">
            <div style="background: #fafafa; border-radius: 12px; padding: 20px; height: 100%;">
              <h4 style="margin: 0 0 12px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Zahlungsart</h4>
              <p style="margin: 0; color: #171717; font-size: 14px; font-weight: 500;">${paymentMethodText}</p>
            </div>
          </td>
        </tr>
      </table>
      
      ${bankTransferInfo}
      
      <div style="text-align: center; margin-top: 32px;">
        ${emailButton('Bestellung ansehen', 'https://aldenair.de/orders', 'secondary')}
      </div>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: [data.customerEmail],
      subject: `Bestellbestätigung ${data.orderNumber} - ALDENAIR`,
      html: emailWrapper(content, `Ihre Bestellung ${data.orderNumber} wurde bestätigt`)
    });
    
    if (result.error) {
      console.error('[Resend] API Error:', result.error);
      return false;
    }
    
    console.log(`[Resend] Order confirmation email sent successfully to ${data.customerEmail}, id: ${result.data?.id}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send order confirmation email:', error.message);
    return false;
  }
}

// ============================================
// 3. SHIPPING NOTIFICATION EMAIL
// ============================================
export async function sendShippingNotificationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  trackingNumber?: string,
  carrier?: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const trackingInfo = trackingNumber ? `
      <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <h4 style="margin: 0 0 8px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Sendungsnummer</h4>
        <p style="margin: 0; color: #171717; font-size: 18px; font-weight: 600; font-family: monospace;">${trackingNumber}</p>
        ${carrier ? `<p style="margin: 8px 0 0 0; color: #737373; font-size: 13px;">Versand via ${carrier}</p>` : ''}
      </div>
    ` : '';
    
    const content = `
      <h2 style="margin:0 0 8px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Ihre Bestellung ist unterwegs</h2>
      <p style="margin:0 0 24px 0;color:#666666;font-size:14px;text-align:center;font-family:Arial,Helvetica,sans-serif;">Bestellung: <strong style="color:#1a1a1a;">${orderNumber}</strong></p>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName},<br><br>
        Gute Nachrichten: Ihre Bestellung wurde versandt und ist auf dem Weg zu Ihnen.
      </p>
      
      ${trackingInfo}
      
      ${infoBox(`
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
          <strong>Voraussichtliche Lieferzeit:</strong> 2-4 Werktage<br>
          Bitte stellen Sie sicher, dass jemand zu Hause ist, um das Paket entgegenzunehmen.
        </p>
      `, 'info')}
      
      <div style="text-align: center; margin-top: 32px;">
        ${trackingNumber ? emailButton('Sendung verfolgen', `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${trackingNumber}`) : ''}
      </div>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Versandbenachrichtigung ${orderNumber} - ALDENAIR`,
      html: emailWrapper(content, 'Ihre ALDENAIR Bestellung wurde versandt!')
    });
    
    console.log(`[Resend] Shipping notification email sent to ${customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send shipping notification email:', error);
    return false;
  }
}

// ============================================
// 4. WELCOME EMAIL WITH PASSWORD
// ============================================
export async function sendWelcomeEmailWithPassword(
  customerEmail: string,
  customerName: string,
  temporaryPassword: string,
  baseUrl: string
): Promise<boolean> {
  try {
    console.log(`[Resend] Sending welcome email with password to: ${customerEmail}`);
    const { client, fromEmail } = await getResendClient();
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Willkommen bei ALDENAIR</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName},<br><br>
        wir freuen uns, Sie bei ALDENAIR begrüssen zu dürfen. Wir haben ein Kundenkonto für Sie erstellt, mit dem Sie Ihre Bestellungen verfolgen und exklusive Vorteile geniessen können.
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f8f8f8;border-radius:6px;margin:24px 0;">
        <tr><td style="padding:20px;">
          <h3 style="margin:0 0 16px 0;color:#1a1a1a;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Ihre Zugangsdaten</h3>
          <p style="margin:0 0 8px 0;color:#666666;font-size:13px;font-family:Arial,Helvetica,sans-serif;">E-Mail-Adresse</p>
          <p style="margin:0 0 16px 0;color:#1a1a1a;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${customerEmail}</p>
          <p style="margin:0 0 8px 0;color:#666666;font-size:13px;font-family:Arial,Helvetica,sans-serif;">Temporäres Passwort</p>
          <p style="margin:0;color:#1a1a1a;font-size:16px;font-weight:700;font-family:monospace;background:#ffffff;padding:10px 14px;border-radius:4px;display:inline-block;border:1px solid #e5e5e5;">${temporaryPassword}</p>
        </td></tr>
      </table>
      
      ${infoBox(`
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>Wichtig:</strong> Bitte ändern Sie Ihr Passwort nach der ersten Anmeldung in Ihrem Kundenkonto unter "Einstellungen".
        </p>
      `, 'warning')}
      
      <div style="text-align: center; margin-top: 32px;">
        ${emailButton('Jetzt anmelden', `${baseUrl}/auth`)}
      </div>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 16px 0; color: #171717; font-size: 15px; font-weight: 600;">Ihre Vorteile als Kunde:</h4>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #404040; font-size: 14px; line-height: 2;">
          <li>Exklusive Rabatte und Angebote</li>
          <li>Bestellhistorie und Sendungsverfolgung</li>
          <li>Treuepunkte sammeln und einlösen</li>
          <li>Schnellerer Checkout</li>
        </ul>
      </div>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: 'Willkommen bei ALDENAIR - Ihre Zugangsdaten',
      html: emailWrapper(content, 'Ihr ALDENAIR Kundenkonto wurde erstellt')
    });
    
    if (result.error) {
      console.error('[Resend] Welcome email error:', result.error);
      return false;
    }
    
    console.log(`[Resend] Welcome email sent successfully to ${customerEmail}, id: ${result.data?.id}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send welcome email:', error.message);
    return false;
  }
}

// ============================================
// 4b. SIMPLE WELCOME EMAIL (for self-registration)
// ============================================
export async function sendWelcomeEmail(
  customerEmail: string,
  customerName: string,
  baseUrl: string = 'https://aldenair.de'
): Promise<boolean> {
  try {
    console.log(`[Resend] Sending welcome email to: ${customerEmail}`);
    const { client, fromEmail } = await getResendClient();
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Willkommen bei ALDENAIR</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName || 'lieber Kunde'},<br><br>
        vielen Dank für Ihre Registrierung bei ALDENAIR. Wir freuen uns, Sie in unserer Parfum-Community begrüssen zu dürfen.
      </p>
      
      ${infoBox(`
        <p style="margin:0;color:#0284c7;font-size:14px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
          Sie können sich jetzt jederzeit mit Ihrer E-Mail-Adresse <strong>${customerEmail}</strong> anmelden.
        </p>
      `, 'info')}
      
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #e5e5e5;">
        <h4 style="margin:0 0 16px 0;color:#1a1a1a;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Ihre Vorteile als Kunde:</h4>
        <ul style="margin:0;padding:0 0 0 20px;color:#404040;font-size:14px;line-height:2;font-family:Arial,Helvetica,sans-serif;">
          <li>Exklusive Rabatte und Angebote</li>
          <li>Bestellhistorie und Sendungsverfolgung</li>
          <li>Treuepunkte sammeln und einlösen</li>
          <li>Schnellerer Checkout</li>
        </ul>
      </div>
      
      <div style="text-align:center;margin-top:32px;">
        ${emailButton('Jetzt shoppen', `${baseUrl}/products`)}
      </div>
    `;

    const result = await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: 'Willkommen bei ALDENAIR!',
      html: emailWrapper(content, 'Ihr ALDENAIR Konto wurde erstellt')
    });
    
    if (result.error) {
      console.error('[Resend] Welcome email error:', result.error);
      return false;
    }
    
    console.log(`[Resend] Welcome email sent successfully to ${customerEmail}, id: ${result.data?.id}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send welcome email:', error.message);
    return false;
  }
}

// ============================================
// 5. ORDER CANCELLATION EMAIL (NEU)
// ============================================
export async function sendOrderCancellationEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  reason?: string,
  refundAmount?: number
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const refundInfo = refundAmount ? `
      <div style="background: #d1fae5; border-radius: 12px; padding: 20px; margin: 24px 0; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">Rückerstattungsbetrag</p>
        <p style="margin: 8px 0 0 0; color: #059669; font-size: 24px; font-weight: 700;">${refundAmount.toFixed(2)} EUR</p>
        <p style="margin: 8px 0 0 0; color: #065f46; font-size: 13px;">Die Rückerstattung erfolgt innerhalb von 5-7 Werktagen.</p>
      </div>
    ` : '';
    
    const content = `
      <h2 style="margin:0 0 8px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Bestellung storniert</h2>
      <p style="margin:0 0 24px 0;color:#666666;font-size:14px;text-align:center;font-family:Arial,Helvetica,sans-serif;">Bestellung: <strong style="color:#1a1a1a;">${orderNumber}</strong></p>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName},<br><br>
        wir bestätigen hiermit, dass Ihre Bestellung storniert wurde.
        ${reason ? `<br><br><strong>Grund:</strong> ${reason}` : ''}
      </p>
      
      ${refundInfo}
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:24px 0;font-family:Arial,Helvetica,sans-serif;">
        Es tut uns leid, dass es diesmal nicht geklappt hat. Wir hoffen, Sie bald wieder bei uns begrüssen zu dürfen.
      </p>
      
      <div style="text-align:center;margin-top:32px;">
        ${emailButton('Weiter einkaufen', 'https://aldenair.de/products')}
      </div>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Stornierungsbestätigung ${orderNumber} - ALDENAIR`,
      html: emailWrapper(content, `Ihre Bestellung ${orderNumber} wurde storniert`)
    });
    
    console.log(`[Resend] Order cancellation email sent to ${customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send cancellation email:', error);
    return false;
  }
}

// ============================================
// 6. REFUND CONFIRMATION EMAIL (NEU)
// ============================================
export async function sendRefundEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  refundAmount: number,
  refundMethod: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const content = `
      <h2 style="margin:0 0 8px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Rückerstattung veranlasst</h2>
      <p style="margin:0 0 24px 0;color:#666666;font-size:14px;text-align:center;font-family:Arial,Helvetica,sans-serif;">Bestellung: <strong style="color:#1a1a1a;">${orderNumber}</strong></p>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName},<br><br>
        wir haben Ihre Rückerstattung veranlasst. Hier sind die Details:
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f0fdf4;border-radius:6px;margin:24px 0;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="margin:0;color:#065f46;font-size:13px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">Rückerstattungsbetrag</p>
          <p style="margin:12px 0;color:#059669;font-size:28px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">${refundAmount.toFixed(2)} EUR</p>
          <p style="margin:0;color:#065f46;font-size:14px;font-family:Arial,Helvetica,sans-serif;">via ${refundMethod}</p>
        </td></tr>
      </table>
      
      ${infoBox(`
        <p style="margin:0;color:#0284c7;font-size:14px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
          <strong>Bearbeitungszeit:</strong> Die Rückerstattung wird innerhalb von 5-7 Werktagen auf Ihrem Konto gutgeschrieben. Bei Kreditkartenzahlungen kann es je nach Bank etwas länger dauern.
        </p>
      `, 'info')}
      
      <p style="color:#888888;font-size:14px;line-height:1.6;margin-top:24px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
        Bei Fragen zu Ihrer Rückerstattung kontaktieren Sie uns gerne unter<br>
        <a href="mailto:support@aldenair.de" style="color:#1a1a1a;text-decoration:none;">support@aldenair.de</a>
      </p>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: `Rückerstattungsbestätigung ${orderNumber} - ALDENAIR`,
      html: emailWrapper(content, `Ihre Rückerstattung von ${refundAmount.toFixed(2)} EUR wurde veranlasst`)
    });
    
    console.log(`[Resend] Refund email sent to ${customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send refund email:', error);
    return false;
  }
}

// ============================================
// 7. NEWSLETTER WELCOME EMAIL (NEU)
// ============================================
export async function sendNewsletterWelcomeEmail(
  email: string,
  firstName?: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const greeting = firstName ? `Hallo ${firstName}` : 'Hallo';
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Willkommen im Newsletter</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        ${greeting},<br><br>
        vielen Dank für Ihre Anmeldung zu unserem Newsletter. Ab jetzt erhalten Sie exklusive Einblicke in die Welt der Düfte.
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fffbeb;border-radius:6px;margin:24px 0;">
        <tr><td style="padding:24px;text-align:center;">
          <h3 style="margin:0 0 8px 0;color:#92400e;font-size:18px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">10% Rabatt</h3>
          <p style="margin:0 0 16px 0;color:#78350f;font-size:14px;font-family:Arial,Helvetica,sans-serif;">auf Ihre nächste Bestellung</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:0 auto;">
            <tr><td style="background:#ffffff;border:2px dashed #d97706;border-radius:6px;padding:12px 24px;">
              <p style="margin:0;color:#d97706;font-size:18px;font-weight:700;font-family:monospace;">WELCOME10</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
      
      <div style="margin-top:32px;">
        <h4 style="margin:0 0 16px 0;color:#1a1a1a;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">Das erwartet Sie:</h4>
        <ul style="margin:0;padding:0 0 0 20px;color:#404040;font-size:14px;line-height:2;font-family:Arial,Helvetica,sans-serif;">
          <li>Exklusive Rabattcodes und Aktionen</li>
          <li>Neuheiten vor allen anderen</li>
          <li>Tipps rund um Parfum und Pflege</li>
          <li>Insider-Informationen zu neuen Düften</li>
        </ul>
      </div>
      
      <div style="text-align:center;margin-top:32px;">
        ${emailButton('Jetzt shoppen', 'https://aldenair.de/products')}
      </div>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Willkommen + 10% Rabatt - ALDENAIR Newsletter',
      html: emailWrapper(content, 'Willkommen im ALDENAIR Newsletter - Hier ist Ihr 10% Rabattcode!')
    });
    
    console.log(`[Resend] Newsletter welcome email sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send newsletter welcome email:', error);
    return false;
  }
}

// ============================================
// 8. CONTACT FORM CONFIRMATION EMAIL (NEU)
// ============================================
export async function sendContactFormConfirmationEmail(
  email: string,
  name: string,
  subject: string,
  message: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Nachricht erhalten</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${name},<br><br>
        vielen Dank für Ihre Nachricht. Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.
      </p>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#f8f8f8;border-radius:6px;margin:24px 0;">
        <tr><td style="padding:20px;">
          <h4 style="margin:0 0 12px 0;color:#888888;font-size:11px;text-transform:uppercase;letter-spacing:1px;font-family:Arial,Helvetica,sans-serif;">Ihre Nachricht</h4>
          <p style="margin:0 0 8px 0;color:#1a1a1a;font-size:15px;font-weight:600;font-family:Arial,Helvetica,sans-serif;">${subject}</p>
          <p style="margin:0;color:#404040;font-size:14px;line-height:1.7;white-space:pre-wrap;font-family:Arial,Helvetica,sans-serif;">${message}</p>
        </td></tr>
      </table>
      
      ${infoBox(`
        <p style="margin:0;color:#0284c7;font-size:14px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
          <strong>Antwortzeit:</strong> Wir antworten in der Regel innerhalb von 24 Stunden (Werktags).
        </p>
      `, 'info')}
    `;

    await client.emails.send({
      from: fromEmail,
      to: [email],
      subject: 'Ihre Anfrage bei ALDENAIR - Wir melden uns!',
      html: emailWrapper(content, 'Wir haben Ihre Nachricht erhalten und melden uns bald!')
    });
    
    console.log(`[Resend] Contact form confirmation email sent to ${email}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send contact form confirmation email:', error);
    return false;
  }
}

// ============================================
// 9. REVIEW REQUEST EMAIL (NEU)
// ============================================
export async function sendReviewRequestEmail(
  customerEmail: string,
  customerName: string,
  orderNumber: string,
  products: Array<{ name: string; image?: string }>,
  baseUrl: string
): Promise<boolean> {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const productsHtml = products.slice(0, 3).map(product => `
      <div style="display: inline-block; text-align: center; padding: 12px; width: 120px;">
        ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">` : ''}
        <p style="margin: 8px 0 0 0; color: #171717; font-size: 13px; line-height: 1.4;">${product.name}</p>
      </div>
    `).join('');
    
    const content = `
      <h2 style="margin:0 0 24px 0;color:#1a1a1a;font-size:22px;font-weight:600;text-align:center;font-family:Arial,Helvetica,sans-serif;">Wie gefällt Ihnen Ihr Duft?</h2>
      
      <p style="color:#404040;font-size:15px;line-height:1.7;margin:0 0 24px 0;text-align:center;font-family:Arial,Helvetica,sans-serif;">
        Guten Tag ${customerName},<br><br>
        wir hoffen, Sie geniessen Ihre neuen Düfte. Ihre Meinung ist uns wichtig - teilen Sie Ihre Erfahrung mit anderen Duftliebhabern.
      </p>
      
      <div style="text-align:center;margin:24px 0;">
        ${productsHtml}
      </div>
      
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:#fffbeb;border-radius:6px;margin:24px 0;">
        <tr><td style="padding:24px;text-align:center;">
          <p style="margin:0;color:#92400e;font-size:14px;font-family:Arial,Helvetica,sans-serif;">Als Dankeschön für Ihre Bewertung erhalten Sie</p>
          <p style="margin:8px 0;color:#d97706;font-size:22px;font-weight:700;font-family:Arial,Helvetica,sans-serif;">50 Treuepunkte</p>
        </td></tr>
      </table>
      
      <div style="text-align:center;margin-top:32px;">
        ${emailButton('Jetzt bewerten', `${baseUrl}/orders`)}
      </div>
      
      <p style="color:#888888;font-size:13px;text-align:center;margin-top:24px;font-family:Arial,Helvetica,sans-serif;">
        Bestellnummer: ${orderNumber}
      </p>
    `;

    await client.emails.send({
      from: fromEmail,
      to: [customerEmail],
      subject: 'Wie gefällt Ihnen Ihr ALDENAIR Duft?',
      html: emailWrapper(content, 'Teilen Sie Ihre Erfahrung und erhalten Sie 50 Treuepunkte!')
    });
    
    console.log(`[Resend] Review request email sent to ${customerEmail}`);
    return true;
  } catch (error: any) {
    console.error('[Resend] Failed to send review request email:', error);
    return false;
  }
}
