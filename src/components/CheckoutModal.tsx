
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CreditCard, AlertCircle, Tag, Check, X } from 'lucide-react';
import { sanitizeInput } from '@/lib/validation';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponValidating, setCouponValidating] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const { items, clearCart } = useCart();
  const { user, supabaseConnected } = useAuth();
  const { toast } = useToast();

  const totalAmount = items.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calculate discount amount
  const discountAmount = appliedCoupon ? 
    appliedCoupon.discount_type === 'percentage' 
      ? Math.min(totalAmount * (appliedCoupon.discount_value / 100), totalAmount)
      : Math.min(appliedCoupon.discount_value / 100, totalAmount)
    : 0;
  
  const finalAmount = totalAmount - discountAmount;

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setAppliedCoupon(null);
      setCouponError('');
      return;
    }

    setCouponValidating(true);
    setCouponError('');

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('active', true)
        .single();

      if (error || !coupon) {
        setCouponError('Ungültiger Rabattcode');
        setAppliedCoupon(null);
        return;
      }

      // Check validity dates
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        setCouponError('Dieser Rabattcode ist noch nicht gültig');
        setAppliedCoupon(null);
        return;
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        setCouponError('Dieser Rabattcode ist abgelaufen');
        setAppliedCoupon(null);
        return;
      }

      // Check minimum order amount
      if (coupon.min_order_amount && totalAmount < coupon.min_order_amount / 100) {
        setCouponError(`Mindestbestellwert: €${(coupon.min_order_amount / 100).toFixed(2)}`);
        setAppliedCoupon(null);
        return;
      }

      // Check usage limits
      if (coupon.max_uses && coupon.current_uses >= coupon.max_uses) {
        setCouponError('Dieser Rabattcode wurde bereits maximal verwendet');
        setAppliedCoupon(null);
        return;
      }

      setAppliedCoupon(coupon);
      setCouponError('');
      
      // Calculate discount for this coupon
      const discount = coupon.discount_type === 'percentage' 
        ? Math.min(totalAmount * (coupon.discount_value / 100), totalAmount)
        : Math.min(coupon.discount_value / 100, totalAmount);
      
      toast({
        title: "Rabattcode angewendet",
        description: `Sie sparen €${discount.toFixed(2)}!`,
      });

    } catch (error) {
      console.error('Coupon validation error:', error);
      setCouponError('Fehler bei der Validierung des Rabattcodes');
      setAppliedCoupon(null);
    } finally {
      setCouponValidating(false);
    }
  };

  const handleCheckout = async () => {
    if (!user && !guestEmail) {
      toast({
        title: "E-Mail Adresse erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein oder melden Sie sich über 'Anmelden' oben rechts an.",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Validate guest email if provided
    if (!user && guestEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        toast({
          title: "Ungültige E-Mail",
          description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          variant: "destructive",
        });
        return;
      }
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
          guestEmail: user ? undefined : sanitizeInput(guestEmail),
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
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
              {appliedCoupon && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabatt ({appliedCoupon.code})</span>
                  <span>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t pt-1">
                <span>Gesamt</span>
                <span>€{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Guest Email Input */}
          {!user && (
            <div className="space-y-2 border-2 border-dashed border-primary/20 p-4 rounded-lg bg-primary/5">
              <Label htmlFor="guest-email" className="text-base font-semibold text-primary">
                E-Mail-Adresse *
              </Label>
              <Input
                id="guest-email"
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                placeholder="ihre@email.de"
                required
                className="border-primary/30 focus:border-primary"
              />
              <p className="text-xs text-muted-foreground">
                <strong>Erforderlich:</strong> Ihre Bestellbestätigung wird an diese E-Mail-Adresse gesendet.
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

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <Label htmlFor="coupon-code" className="flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Rabattcode (optional)
            </Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="RABATT10"
                className={appliedCoupon ? 'border-green-500' : couponError ? 'border-red-500' : ''}
              />
              <Button
                type="button"
                onClick={() => validateCoupon(couponCode)}
                disabled={couponValidating || !couponCode.trim()}
                variant="outline"
                size="sm"
              >
                {couponValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : appliedCoupon ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  'Anwenden'
                )}
              </Button>
            </div>
            
            {couponError && (
              <div className="flex items-center gap-2 text-sm text-red-600">
                <X className="w-4 h-4" />
                {couponError}
              </div>
            )}
            
            {appliedCoupon && (
              <div className="flex items-center justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>Rabattcode "{appliedCoupon.code}" angewendet</span>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                    setCouponError('');
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

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
            ) : (!user && !guestEmail) ? (
              "E-Mail-Adresse eingeben zum Bezahlen"
            ) : (
              `Jetzt bezahlen - €${finalAmount.toFixed(2)}`
            )}
          </Button>
          
          {!user && !guestEmail && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
              <strong>Hinweis:</strong> Bitte geben Sie Ihre E-Mail-Adresse ein oder melden Sie sich an, um fortzufahren.
            </p>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Sichere Zahlung über Stripe. Sie werden zu einem sicheren Checkout weitergeleitet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
