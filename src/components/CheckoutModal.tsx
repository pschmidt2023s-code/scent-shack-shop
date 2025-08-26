
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, AlertCircle } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const { items, clearCart } = useCart();
  const { user, supabaseConnected } = useAuth();
  const { toast } = useToast();

  const totalAmount = items.reduce((sum, item) => sum + (44.99 * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!user && !guestEmail) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein oder melden Sie sich an.",
        variant: "destructive",
      });
      return;
    }

    if (!supabase || !supabaseConnected) {
      toast({
        title: "Supabase Verbindung erforderlich",
        description: "Bitte verbinden Sie Ihr Projekt mit Supabase für Zahlungen.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: {
          items,
          guestEmail: user ? undefined : guestEmail,
        },
      });

      if (error) throw error;

      // Open Stripe checkout in the same tab
      window.location.href = data.url;
      
      // Clear cart after successful checkout initiation
      clearCart();
      onOpenChange(false);
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Checkout fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  if (!supabaseConnected) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              Supabase Verbindung erforderlich
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Um Zahlungen zu verarbeiten, muss Ihr Projekt mit Supabase verbunden sein.
            </p>
            <p className="text-sm text-muted-foreground">
              Klicken Sie auf den grünen Supabase-Button oben rechts, um die Verbindung herzustellen.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Zur Kasse
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Summary */}
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">Bestellübersicht</h3>
            {items.map((item) => (
              <div key={item.perfume.id} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.perfume.name}</span>
                <span>€{(44.99 * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 flex justify-between font-semibold">
              <span>Gesamt ({itemCount} Artikel)</span>
              <span>€{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Guest Email Input */}
          {!user && (
            <div className="space-y-2">
              <Label htmlFor="guest-email">E-Mail-Adresse</Label>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
              />
              <p className="text-xs text-muted-foreground">
                Ihre Bestellbestätigung wird an diese E-Mail-Adresse gesendet.
              </p>
            </div>
          )}

          {user && (
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="text-sm text-green-800">
                Angemeldet als: {user.email}
              </p>
            </div>
          )}

          <Button
            onClick={handleCheckout}
            disabled={loading || (!user && !guestEmail)}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Wird weitergeleitet...
              </>
            ) : (
              `Jetzt bezahlen - €${totalAmount.toFixed(2)}`
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Sichere Zahlung über Stripe. Sie werden zu einem sicheren Checkout weitergeleitet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
