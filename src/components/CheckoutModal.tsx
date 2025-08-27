
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, AlertCircle, Tag } from 'lucide-react';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponLoading, setCouponLoading] = useState(false);
  const { items, clearCart } = useCart();
  const { user, supabaseConnected } = useAuth();
  const { toast } = useToast();

  const totalAmount = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const finalAmount = totalAmount - couponDiscount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('active', true)
        .single();

      if (error || !coupon) {
        toast({
          title: "Ungültiger Coupon",
          description: "Der eingegebene Coupon-Code ist nicht gültig oder abgelaufen.",
          variant: "destructive",
        });
        return;
      }

      // Check validity dates
      const now = new Date();
      const validFrom = new Date(coupon.valid_from);
      const validUntil = coupon.valid_until ? new Date(coupon.valid_until) : null;

      if (now < validFrom || (validUntil && now > validUntil)) {
        toast({
          title: "Coupon abgelaufen",
          description: "Dieser Coupon ist nicht mehr gültig.",
          variant: "destructive",
        });
        return;
      }

      // Check usage limits
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        toast({
          title: "Coupon ausgeschöpft",
          description: "Dieser Coupon wurde bereits zu oft verwendet.",
          variant: "destructive",
        });
        return;
      }

      // Check minimum order amount
      if (totalAmount < coupon.min_order_amount) {
        toast({
          title: "Mindestbestellwert nicht erreicht",
          description: `Für diesen Coupon ist ein Mindestbestellwert von €${coupon.min_order_amount.toFixed(2)} erforderlich.`,
          variant: "destructive",
        });
        return;
      }

      // Calculate discount
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = totalAmount * (coupon.discount_value / 100);
      } else {
        discount = coupon.discount_value;
      }

      setCouponDiscount(Math.min(discount, totalAmount)); // Don't exceed total amount
      setCouponApplied(true);

      toast({
        title: "Coupon angewendet",
        description: `Du sparst €${discount.toFixed(2)} mit dem Code ${coupon.code}!`,
      });
    } catch (error) {
      console.error('Coupon error:', error);
      toast({
        title: "Fehler",
        description: "Coupon konnte nicht angewendet werden.",
        variant: "destructive",
      });
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setCouponDiscount(0);
    setCouponApplied(false);
  };

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
          couponCode: couponApplied ? couponCode : undefined,
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
              <div key={`${item.perfume.id}-${item.variant.id}`} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.perfume.name} - {item.variant.name}</span>
                <span>€{(item.variant.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span>Zwischensumme ({itemCount} Artikel)</span>
                <span>€{totalAmount.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabatt ({couponCode})</span>
                  <span>-€{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t pt-1">
                <span>Gesamt</span>
                <span>€{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Coupon Section */}
          <div className="space-y-2">
            <Label htmlFor="coupon">Coupon Code (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="RABATT10"
                disabled={couponApplied}
              />
              {couponApplied ? (
                <Button variant="outline" onClick={removeCoupon}>
                  Entfernen
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={applyCoupon}
                  disabled={!couponCode.trim() || couponLoading}
                >
                  {couponLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Tag className="w-4 h-4 mr-1" />
                      Anwenden
                    </>
                  )}
                </Button>
              )}
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
              `Jetzt bezahlen - €${finalAmount.toFixed(2)}`
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
