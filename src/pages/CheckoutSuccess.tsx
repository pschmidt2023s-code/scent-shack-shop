
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Package } from 'lucide-react';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-green-800">
            Zahlung erfolgreich!
          </h1>
          <p className="text-muted-foreground">
            Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungsmail.
          </p>
        </div>

        {sessionId && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Bestellnummer: <span className="font-mono">{sessionId.slice(-8)}</span>
            </p>
          </div>
        )}

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="w-4 h-4" />
            <span>Ihre Bestellung wird in 2-3 Werktagen versendet</span>
          </div>
        </div>

        <div className="space-y-2">
          <Link to="/">
            <Button className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück zum Shop
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
