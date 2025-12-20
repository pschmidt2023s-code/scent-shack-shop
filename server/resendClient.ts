// Resend email client - uses RESEND_API_KEY environment variable
import { Resend } from 'resend';

const DEFAULT_FROM_EMAIL = 'ALDENAIR <noreply@aldenair.de>';

// Modern email template wrapper with elegant gradient header
function emailWrapper(content: string, preheader?: string): string {
  return `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light">
      <meta name="supported-color-schemes" content="light">
      ${preheader ? `<!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      </style>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #0f0f0f;">
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 560px; margin: 0 auto;">
              <!-- Header with gradient -->
              <tr>
                <td style="background: linear-gradient(135deg, #d97706 0%, #ea580c 50%, #dc2626 100%); border-radius: 16px 16px 0 0; padding: 32px 40px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 2px;">ALDENAIR</h1>
                  <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px; letter-spacing: 1px; text-transform: uppercase;">Premium Parfums</p>
                </td>
              </tr>
              <!-- Content -->
              <tr>
                <td style="background-color: #ffffff; padding: 40px; border-radius: 0 0 16px 16px;">
                  ${content}
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 20px; text-align: center;">
                  <p style="margin: 0 0 16px 0; color: #737373; font-size: 13px;">
                    Folgen Sie uns
                  </p>
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding: 0 8px;">
                        <a href="https://instagram.com/aldenair" style="color: #d97706; text-decoration: none; font-size: 14px;">Instagram</a>
                      </td>
                      <td style="color: #404040;">|</td>
                      <td style="padding: 0 8px;">
                        <a href="https://facebook.com/aldenair" style="color: #d97706; text-decoration: none; font-size: 14px;">Facebook</a>
                      </td>
                      <td style="color: #404040;">|</td>
                      <td style="padding: 0 8px;">
                        <a href="https://tiktok.com/@aldenair" style="color: #d97706; text-decoration: none; font-size: 14px;">TikTok</a>
                      </td>
                    </tr>
                  </table>
                  <p style="margin: 24px 0 0 0; color: #525252; font-size: 12px; line-height: 1.6;">
                    ALDENAIR GmbH<br>
                    Bei Fragen: <a href="mailto:info@aldenair.de" style="color: #d97706; text-decoration: none;">info@aldenair.de</a>
                  </p>
                  <p style="margin: 16px 0 0 0; color: #737373; font-size: 11px;">
                    &copy; ${new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
                  </p>
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

// Modern button component
function emailButton(text: string, href: string, variant: 'primary' | 'secondary' = 'primary'): string {
  const styles = variant === 'primary' 
    ? 'background: linear-gradient(135deg, #d97706, #ea580c); color: #ffffff;'
    : 'background: transparent; color: #d97706; border: 2px solid #d97706;';
  
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="${styles} padding: 16px 36px; border-radius: 8px; text-align: center;">
          <a href="${href}" style="color: inherit; text-decoration: none; font-weight: 600; font-size: 15px; display: inline-block;">${text}</a>
        </td>
      </tr>
    </table>
  `;
}

// Info box component
function infoBox(content: string, variant: 'warning' | 'success' | 'info' = 'info'): string {
  const colors = {
    warning: { bg: '#fef3c7', border: '#fbbf24', text: '#92400e' },
    success: { bg: '#d1fae5', border: '#34d399', text: '#065f46' },
    info: { bg: '#eff6ff', border: '#3b82f6', text: '#1e40af' }
  };
  const c = colors[variant];
  
  return `
    <div style="background: ${c.bg}; border-left: 4px solid ${c.border}; border-radius: 0 8px 8px 0; padding: 20px; margin: 24px 0;">
      ${content}
    </div>
  `;
}

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

// ============================================
// 1. PASSWORD RESET EMAIL
// ============================================
export async function sendPasswordResetEmail(to: string, resetToken: string, baseUrl: string) {
  try {
    const { client, fromEmail } = await getResendClient();
    const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;
    
    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#128274;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Passwort zurücksetzen</h2>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
        Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button unten, um ein neues Passwort zu erstellen.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        ${emailButton('Passwort zurücksetzen', resetLink)}
      </div>
      
      ${infoBox(`
        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
          <strong>Hinweis:</strong> Dieser Link ist nur 1 Stunde gültig. Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren.
        </p>
      `, 'warning')}
      
      <p style="color: #737373; font-size: 13px; text-align: center; margin-top: 24px;">
        Link funktioniert nicht? Kopieren Sie diese URL:<br>
        <span style="color: #d97706; word-break: break-all;">${resetLink}</span>
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
                              data.paymentMethod === 'bank' ? 'Banküberweisung' : 
                              data.paymentMethod === 'paypal' ? 'PayPal' : data.paymentMethod;

    const bankTransferInfo = data.paymentMethod === 'bank' ? infoBox(`
      <h4 style="margin: 0 0 12px 0; color: #92400e; font-size: 15px; font-weight: 600;">Zahlungsinformationen</h4>
      <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
        <strong>Empfänger:</strong> ALDENAIR GmbH<br>
        <strong>IBAN:</strong> DE89 3704 0044 0532 0130 00<br>
        <strong>BIC:</strong> COBADEFFXXX<br>
        <strong>Verwendungszweck:</strong> ${data.orderNumber}
      </p>
    `, 'warning') : '';

    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#10003;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Vielen Dank für Ihre Bestellung!</h2>
        <p style="margin: 8px 0 0 0; color: #737373; font-size: 14px;">Bestellnummer: <strong style="color: #d97706;">${data.orderNumber}</strong></p>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 32px 0;">
        Hallo ${data.customerName},<br><br>
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#128230;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Ihre Bestellung ist unterwegs!</h2>
        <p style="margin: 8px 0 0 0; color: #737373; font-size: 14px;">Bestellung: <strong style="color: #d97706;">${orderNumber}</strong></p>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
        Hallo ${customerName},<br><br>
        Gute Nachrichten! Ihre Bestellung wurde versandt und ist auf dem Weg zu Ihnen.
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#127881;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Willkommen bei ALDENAIR!</h2>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        Hallo ${customerName},<br><br>
        wir freuen uns, Sie in der ALDENAIR Familie begrüssen zu dürfen! Wir haben ein Kundenkonto für Sie erstellt, mit dem Sie Ihre Bestellungen verfolgen und exklusive Vorteile geniessen können.
      </p>
      
      <div style="background: linear-gradient(135deg, #fefce8, #fef3c7); border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h3 style="margin: 0 0 16px 0; color: #92400e; font-size: 16px; font-weight: 600; text-align: center;">Ihre Zugangsdaten</h3>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #78350f; font-size: 13px;">E-Mail-Adresse</p>
              <p style="margin: 4px 0 0 0; color: #171717; font-size: 15px; font-weight: 600;">${customerEmail}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0;">
              <p style="margin: 0; color: #78350f; font-size: 13px;">Temporäres Passwort</p>
              <p style="margin: 4px 0 0 0; color: #171717; font-size: 18px; font-weight: 700; font-family: monospace; background: #fff; padding: 8px 12px; border-radius: 6px; display: inline-block;">${temporaryPassword}</p>
            </td>
          </tr>
        </table>
      </div>
      
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fee2e2, #fecaca); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#10006;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Bestellung storniert</h2>
        <p style="margin: 8px 0 0 0; color: #737373; font-size: 14px;">Bestellung: <strong style="color: #d97706;">${orderNumber}</strong></p>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        Hallo ${customerName},<br><br>
        wir bestätigen hiermit, dass Ihre Bestellung storniert wurde.
        ${reason ? `<br><br><strong>Grund:</strong> ${reason}` : ''}
      </p>
      
      ${refundInfo}
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 24px 0;">
        Es tut uns leid, dass es diesmal nicht geklappt hat. Wir hoffen, Sie bald wieder bei uns begrüssen zu dürfen.
      </p>
      
      <div style="text-align: center; margin-top: 32px;">
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#128176;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Rückerstattung veranlasst</h2>
        <p style="margin: 8px 0 0 0; color: #737373; font-size: 14px;">Bestellung: <strong style="color: #d97706;">${orderNumber}</strong></p>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        Hallo ${customerName},<br><br>
        wir haben Ihre Rückerstattung veranlasst. Hier sind die Details:
      </p>
      
      <div style="background: linear-gradient(135deg, #ecfdf5, #d1fae5); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin: 0; color: #065f46; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Rückerstattungsbetrag</p>
        <p style="margin: 12px 0; color: #059669; font-size: 32px; font-weight: 700;">${refundAmount.toFixed(2)} EUR</p>
        <p style="margin: 0; color: #065f46; font-size: 14px;">via ${refundMethod}</p>
      </div>
      
      ${infoBox(`
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
          <strong>Bearbeitungszeit:</strong> Die Rückerstattung wird innerhalb von 5-7 Werktagen auf Ihrem Konto gutgeschrieben. Bei Kreditkartenzahlungen kann es je nach Bank etwas länger dauern.
        </p>
      `, 'info')}
      
      <p style="color: #737373; font-size: 14px; line-height: 1.6; margin-top: 24px; text-align: center;">
        Bei Fragen zu Ihrer Rückerstattung kontaktieren Sie uns gerne unter<br>
        <a href="mailto:support@aldenair.de" style="color: #d97706; text-decoration: none;">support@aldenair.de</a>
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#128140;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Willkommen im Newsletter!</h2>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        ${greeting},<br><br>
        vielen Dank für Ihre Anmeldung zu unserem Newsletter! Ab jetzt erhalten Sie exklusive Einblicke in die Welt der Düfte.
      </p>
      
      <div style="background: linear-gradient(135deg, #fefce8, #fef3c7); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 20px; font-weight: 700;">10% Rabatt</h3>
        <p style="margin: 0 0 16px 0; color: #78350f; font-size: 14px;">auf Ihre nächste Bestellung</p>
        <div style="background: #fff; border: 2px dashed #d97706; border-radius: 8px; padding: 12px 24px; display: inline-block;">
          <p style="margin: 0; color: #d97706; font-size: 20px; font-weight: 700; font-family: monospace;">WELCOME10</p>
        </div>
      </div>
      
      <div style="margin-top: 32px;">
        <h4 style="margin: 0 0 16px 0; color: #171717; font-size: 15px; font-weight: 600;">Das erwartet Sie:</h4>
        <ul style="margin: 0; padding: 0 0 0 20px; color: #404040; font-size: 14px; line-height: 2;">
          <li>Exklusive Rabattcodes und Aktionen</li>
          <li>Neuheiten vor allen anderen</li>
          <li>Tipps rund um Parfum und Pflege</li>
          <li>Insider-Informationen zu neuen Düften</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #dbeafe, #bfdbfe); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#128172;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Nachricht erhalten!</h2>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0;">
        Hallo ${name},<br><br>
        vielen Dank für Ihre Nachricht! Wir haben Ihre Anfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.
      </p>
      
      <div style="background: #fafafa; border-radius: 12px; padding: 24px; margin: 24px 0;">
        <h4 style="margin: 0 0 16px 0; color: #737373; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Ihre Nachricht</h4>
        <p style="margin: 0 0 8px 0; color: #171717; font-size: 15px; font-weight: 600;">${subject}</p>
        <p style="margin: 0; color: #404040; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${message}</p>
      </div>
      
      ${infoBox(`
        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
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
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
          <span style="font-size: 28px;">&#11088;</span>
        </div>
        <h2 style="margin: 0; color: #171717; font-size: 24px; font-weight: 600;">Wie gefällt Ihnen Ihr Duft?</h2>
      </div>
      
      <p style="color: #404040; font-size: 15px; line-height: 1.7; margin: 0 0 24px 0; text-align: center;">
        Hallo ${customerName},<br><br>
        wir hoffen, Sie geniessen Ihre neuen Düfte! Ihre Meinung ist uns wichtig - teilen Sie Ihre Erfahrung mit anderen Duftliebhabern.
      </p>
      
      <div style="text-align: center; margin: 24px 0;">
        ${productsHtml}
      </div>
      
      <div style="background: linear-gradient(135deg, #fefce8, #fef3c7); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">Als Dankeschön für Ihre Bewertung erhalten Sie</p>
        <p style="margin: 8px 0; color: #d97706; font-size: 24px; font-weight: 700;">50 Treuepunkte</p>
      </div>
      
      <div style="text-align: center; margin-top: 32px;">
        ${emailButton('Jetzt bewerten', `${baseUrl}/orders`)}
      </div>
      
      <p style="color: #737373; font-size: 13px; text-align: center; margin-top: 24px;">
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
