
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Download, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [invoiceGenerated, setInvoiceGenerated] = useState(false);
  const [orderId, setOrderId] = useState<string>('');

  useEffect(() => {
    if (sessionId) {
      generateInvoice(sessionId);
    }
  }, [sessionId]);

  const generateInvoice = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: { sessionId },
      });

      if (error) throw error;

      setInvoiceGenerated(true);
      setOrderId(data.orderId || '');
    } catch (error) {
      console.error('Invoice generation error:', error);
      // Don't show error to user as the payment was successful
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">Zahlung erfolgreich!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Vielen Dank für Ihre Bestellung! Ihre Zahlung wurde erfolgreich verarbeitet.
          </p>
          
          {orderId && (
            <p className="text-sm">
              <strong>Bestellnummer:</strong> #{orderId.slice(-8).toUpperCase()}
            </p>
          )}

          {invoiceGenerated && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Ihre Rechnung wurde automatisch an Ihre E-Mail-Adresse gesendet.
              </p>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              Sie erhalten in Kürze eine Bestellbestätigung per E-Mail.
            </p>
            <p className="text-sm text-muted-foreground">
              Ihre Bestellung wird innerhalb von 2-5 Werktagen versendet.
            </p>
          </div>

          <Button asChild className="w-full">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Zurück zur Startseite
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
