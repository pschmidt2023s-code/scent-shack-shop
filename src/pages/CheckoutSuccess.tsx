
import { useEffect, useState } from 'react';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Package, CreditCard, Building2, Banknote, Home } from 'lucide-react';

export default function CheckoutSuccess() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);

  useEffect(() => {
    // Get order details from state or URL params
    const stateData = location.state;
    const paypalSuccess = searchParams.get('paypal') === 'true';
    const orderFromUrl = searchParams.get('order');
    const sessionId = searchParams.get('session_id');

    if (stateData) {
      setOrderDetails(stateData);
    } else if (paypalSuccess && orderFromUrl) {
      setOrderDetails({
        orderNumber: orderFromUrl,
        paymentMethod: 'paypal',
        totalAmount: 0 // Will be fetched from order if needed
      });
    } else if (sessionId) {
      // Handle Stripe success
      setOrderDetails({
        orderNumber: sessionId,
        paymentMethod: 'card',
        totalAmount: 0
      });
      generateInvoice(sessionId);
    }
  }, [location.state, searchParams]);

  const generateInvoice = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { sessionId },
      });

      if (error) throw error;

      setInvoiceGenerated(true);
      if (data.orderId) {
        setOrderDetails(prev => ({
          ...prev,
          orderNumber: data.orderId
        }));
      }
    } catch (error) {
      console.error('Invoice generation error:', error);
      // Don't show error to user as the payment was successful
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'paypal':
      case 'paypal_me':
        return <CreditCard className="w-5 h-5" />;
      case 'bank':
        return <Building2 className="w-5 h-5" />;
      case 'card':
        return <CreditCard className="w-5 h-5" />;
      case 'test':
        return <Banknote className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'paypal':
        return 'PayPal';
      case 'paypal_me':
        return 'PayPal.me';
      case 'bank':
        return 'Banküberweisung';
      case 'card':
        return 'Kreditkarte';
      case 'test':
        return 'Test-Zahlung';
      default:
        return 'Unbekannt';
    }
  };

  const getStatusBadge = (method: string) => {
    switch (method) {
      case 'paypal':
      case 'paypal_me':
      case 'card':
        return <Badge variant="default">Bezahlt</Badge>;
      case 'test':
        return <Badge variant="secondary">Test</Badge>;
      case 'bank':
        return <Badge variant="outline">Überweisung ausstehend</Badge>;
      default:
        return <Badge variant="outline">Ausstehend</Badge>;
    }
  };

  return (
    <div className="min-h-screen glass">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-700 mb-2">
              Bestellung erfolgreich!
            </h1>
            <p className="text-muted-foreground">
              Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
            </p>
          </div>

          {orderDetails && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Bestelldetails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Bestellnummer:</span>
                  <span className="font-mono font-medium">
                    {orderDetails.orderNumber.length > 10 ? 
                      `#${orderDetails.orderNumber.slice(-8).toUpperCase()}` : 
                      orderDetails.orderNumber}
                  </span>
                </div>

                {orderDetails.totalAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Betrag:</span>
                    <span className="font-medium">{orderDetails.totalAmount.toFixed(2)}€</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Zahlungsart:</span>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(orderDetails.paymentMethod)}
                    <span>{getPaymentMethodText(orderDetails.paymentMethod)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status:</span>
                  {getStatusBadge(orderDetails.paymentMethod)}
                </div>

                {invoiceGenerated && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      ✓ Ihre Rechnung wurde automatisch an Ihre E-Mail-Adresse gesendet.
                    </p>
                  </div>
                )}

                {orderDetails.paymentMethod === 'paypal_me' && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium mb-2 text-blue-800">PayPal.me Zahlung</h4>
                    <p className="text-sm text-blue-700">
                      Bitte schließen Sie die Zahlung in dem geöffneten PayPal.me Tab ab. 
                      Ihre Bestellung wird nach Zahlungseingang bearbeitet und Sie erhalten eine weitere Bestätigung per E-Mail.
                    </p>
                  </div>
                )}

                {orderDetails.paymentMethod === 'bank' && orderDetails.bankDetails && (
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Überweisungsdetails</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Empfänger:</span>
                        <span className="font-mono">{orderDetails.bankDetails.recipient}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">IBAN:</span>
                        <span className="font-mono">{orderDetails.bankDetails.iban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">BIC:</span>
                        <span className="font-mono">{orderDetails.bankDetails.bic}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verwendungszweck:</span>
                        <span className="font-mono font-medium">{orderDetails.bankDetails.purpose}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Bitte überweisen Sie den Betrag mit der angegebenen Bestellnummer als Verwendungszweck.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Wie geht es weiter?</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">1</div>
                <div>
                  <p className="font-medium text-foreground">Bestätigung per E-Mail</p>
                  <p>Sie erhalten eine Bestellbestätigung mit allen Details per E-Mail.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">2</div>
                <div>
                  <p className="font-medium text-foreground">Bearbeitung</p>
                  <p>Ihre Bestellung wird innerhalb von 1-2 Werktagen bearbeitet und verpackt.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium mt-0.5">3</div>
                <div>
                  <p className="font-medium text-foreground">Versand</p>
                  <p>Nach dem Versand erhalten Sie eine Tracking-Nummer per E-Mail.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button asChild className="flex-1">
              <Link to="/">
                <Home className="w-4 h-4 mr-2" />
                Weiter einkaufen
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/contact">Kontakt</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
