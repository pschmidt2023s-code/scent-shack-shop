
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, ShoppingBag } from 'lucide-react';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <XCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-red-800">
            Zahlung abgebrochen
          </h1>
          <p className="text-muted-foreground">
            Ihre Bestellung wurde nicht abgeschlossen. Ihre Artikel befinden sich noch im Warenkorb.
          </p>
        </div>

        <div className="space-y-2">
          <Link to="/">
            <Button className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Zurück zum Warenkorb
            </Button>
          </Link>
          
          <Link to="/">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Weiter einkaufen
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
