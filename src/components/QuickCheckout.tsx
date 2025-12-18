import { useState } from 'react';
import { Zap, CreditCard, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface QuickCheckoutProps {
  productId: string;
  variantId: string;
  price: number;
  name: string;
}

export function QuickCheckout({ productId, variantId, price, name }: QuickCheckoutProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleQuickBuy = async () => {
    if (!user) {
      toast.error('Bitte melde dich an, um fortzufahren');
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Redirect to checkout with product info
      navigate(`/checkout?productId=${productId}&variantId=${variantId}&express=true`);
      
      toast.success('Express-Checkout gestartet!');
      setOpen(false);
    } catch (error) {
      console.error('Error starting quick checkout:', error);
      toast.error('Fehler bei der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
        size="lg"
      >
        <Zap className="w-4 h-4" />
        Express-Kauf
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Express-Checkout
            </DialogTitle>
            <DialogDescription>
              Schneller Kauf mit deinen gespeicherten Daten
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">{name}</h4>
              <p className="text-2xl font-bold text-primary">€{price.toFixed(2)}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Truck className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Kostenloser Versand</p>
                  <p className="text-xs text-muted-foreground">Lieferung in 2-3 Werktagen</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Sichere Zahlung</p>
                  <p className="text-xs text-muted-foreground">PayPal, Karte oder Sofortüberweisung</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleQuickBuy}
              disabled={loading}
              className="w-full gap-2"
              size="lg"
            >
              <Zap className="w-4 h-4" />
              {loading ? 'Wird vorbereitet...' : 'Jetzt Express kaufen'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Du kannst die Zahlungsmethode im nächsten Schritt wählen.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
