import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Copy, Check, ArrowLeft, Home } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CheckoutBank() {
  const location = useLocation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const { orderNumber, totalAmount, bankDetails } = location.state || {};

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success('In Zwischenablage kopiert');
    setTimeout(() => setCopied(null), 2000);
  };

  if (!orderNumber) {
    return (
      <div className="min-h-screen glass flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>Keine Bestelldaten gefunden.</p>
            <Button onClick={() => navigate('/')} className="mt-4">
              Zur Startseite
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen glass">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zur Startseite
          </Button>

          <Card className="mb-6">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">Bestellung erfolgreich aufgegeben!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-lg mb-2">
                  Vielen Dank für Ihre Bestellung!
                </p>
                <p className="text-muted-foreground">
                  Ihre Bestellnummer: <span className="font-bold text-primary">{orderNumber}</span>
                </p>
                <p className="text-muted-foreground">
                  Gesamtbetrag: <span className="font-bold">{totalAmount?.toFixed(2)}€</span>
                </p>
              </div>

              <div className="bg-muted/50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Überweisungsdaten</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Empfänger:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bankDetails?.recipient}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bankDetails?.recipient, 'recipient')}
                      >
                        {copied === 'recipient' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">IBAN:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{bankDetails?.iban}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bankDetails?.iban, 'iban')}
                      >
                        {copied === 'iban' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">BIC:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{bankDetails?.bic}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bankDetails?.bic, 'bic')}
                      >
                        {copied === 'bic' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Betrag:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{totalAmount?.toFixed(2)}€</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(totalAmount?.toFixed(2) + '€', 'amount')}
                      >
                        {copied === 'amount' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded border-l-4 border-primary">
                    <span className="font-semibold">Verwendungszweck:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-primary">{bankDetails?.purpose}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(bankDetails?.purpose, 'purpose')}
                      >
                        {copied === 'purpose' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Wichtige Hinweise:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Bitte geben Sie unbedingt die <strong>Bestellnummer {orderNumber}</strong> als Verwendungszweck an</li>
                  <li>• Die Bearbeitung erfolgt nach Zahlungseingang</li>
                  <li>• Bei Überweisungen kann es 1-3 Werktage dauern</li>
                  <li>• Sie erhalten eine E-Mail-Bestätigung, sobald die Zahlung eingegangen ist</li>
                </ul>
              </div>

              <div className="text-center">
                <Button onClick={() => navigate('/')} className="mr-4">
                  <Home className="w-4 h-4 mr-2" />
                  Zur Startseite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}