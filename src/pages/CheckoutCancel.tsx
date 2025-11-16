
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CheckoutCancel() {
  return (
    <div className="min-h-screen glass flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">Zahlung abgebrochen</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Ihre Zahlung wurde abgebrochen. Keine Sorge, es wurden keine Gebühren erhoben.
          </p>
          
          <p className="text-sm text-muted-foreground">
            Ihre Artikel befinden sich weiterhin in Ihrem Warenkorb.
          </p>

          <div className="space-y-2 pt-4">
            <Button asChild className="w-full">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Weiter einkaufen
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
