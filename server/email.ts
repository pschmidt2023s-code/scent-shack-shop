import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

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
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email');
    return false;
  }

  const itemsHtml = data.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)} EUR</td>
    </tr>
  `).join('');

  const paymentMethodText = data.paymentMethod === 'card' ? 'Kreditkarte' : 
                            data.paymentMethod === 'bank' ? 'Banküberweisung' : data.paymentMethod;

  const bankTransferInfo = data.paymentMethod === 'bank' && process.env.BANK_IBAN ? `
    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="margin-top: 0;">Bankverbindung für Überweisung</h3>
      <p><strong>Empfänger:</strong> ${process.env.BANK_RECIPIENT || 'ALDENAIR'}</p>
      <p><strong>IBAN:</strong> ${process.env.BANK_IBAN}</p>
      <p><strong>BIC:</strong> ${process.env.BANK_BIC || ''}</p>
      <p><strong>Verwendungszweck:</strong> ${data.orderNumber}</p>
    </div>
  ` : '';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Bestellbestätigung</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">ALDENAIR</h1>
        <p style="color: #666;">Vielen Dank für Ihre Bestellung!</p>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin-top: 0;">Bestellnummer: ${data.orderNumber}</h2>
        <p>Hallo ${data.customerName},</p>
        <p>wir haben Ihre Bestellung erhalten und werden sie schnellstmöglich bearbeiten.</p>
      </div>
      
      <h3>Bestellübersicht</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #333; color: white;">
            <th style="padding: 10px; text-align: left;">Artikel</th>
            <th style="padding: 10px; text-align: center;">Menge</th>
            <th style="padding: 10px; text-align: right;">Preis</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Versand:</strong></td>
            <td style="padding: 10px; text-align: right;">${data.shippingCost > 0 ? data.shippingCost.toFixed(2) + ' EUR' : 'Kostenlos'}</td>
          </tr>
          <tr style="background: #f5f5f5;">
            <td colspan="2" style="padding: 10px; text-align: right;"><strong>Gesamtbetrag:</strong></td>
            <td style="padding: 10px; text-align: right;"><strong>${data.totalAmount.toFixed(2)} EUR</strong></td>
          </tr>
        </tbody>
      </table>
      
      <h3>Lieferadresse</h3>
      <p>
        ${data.customerName}<br>
        ${data.shippingAddress.street}<br>
        ${data.shippingAddress.postalCode} ${data.shippingAddress.city}<br>
        ${data.shippingAddress.country || 'Deutschland'}
      </p>
      
      <h3>Zahlungsart</h3>
      <p>${paymentMethodText}</p>
      
      ${bankTransferInfo}
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
        <p>Bei Fragen kontaktieren Sie uns unter info@aldenair.de</p>
        <p>&copy; ${new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: data.customerEmail,
      subject: `Bestellbestätigung - ${data.orderNumber}`,
      html,
    });
    console.log(`Order confirmation email sent to ${data.customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    return false;
  }
}

export async function sendShippingNotificationEmail(
  customerEmail: string,
  orderNumber: string,
  trackingNumber?: string
): Promise<boolean> {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('SMTP not configured, skipping email');
    return false;
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Versandbenachrichtigung</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333;">ALDENAIR</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0;">Ihre Bestellung wurde versandt!</h2>
        <p>Bestellnummer: <strong>${orderNumber}</strong></p>
        ${trackingNumber ? `<p>Sendungsnummer: <strong>${trackingNumber}</strong></p>` : ''}
        <p>Ihre Bestellung ist auf dem Weg zu Ihnen. Die Lieferung erfolgt in der Regel innerhalb von 2-4 Werktagen.</p>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
        <p>&copy; ${new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.</p>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: customerEmail,
      subject: `Versandbenachrichtigung - ${orderNumber}`,
      html,
    });
    console.log(`Shipping notification email sent to ${customerEmail}`);
    return true;
  } catch (error) {
    console.error('Failed to send shipping notification email:', error);
    return false;
  }
}
