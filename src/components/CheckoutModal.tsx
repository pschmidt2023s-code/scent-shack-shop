
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Loader2, CreditCard, AlertCircle, Tag, Check, X } from 'lucide-react';
import { sanitizeInput } from '@/lib/validation';

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CheckoutModal({ open, onOpenChange }: CheckoutModalProps) {
  const { items, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const totalAmount = total;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

   // Calculate discount amount (both values now in euros)
   const discountAmount = appliedCoupon ? 
     appliedCoupon.discount_type === 'percentage' 
       ? Math.min(totalAmount * (appliedCoupon.discount_value / 100), totalAmount)
       : Math.min(appliedCoupon.discount_value, totalAmount)
     : 0;
  
  const finalAmount = totalAmount - discountAmount;

  const validateCoupon = async (code: string) => {
    if (!code.trim()) {
      setAppliedCoupon(null);
      return;
    }

    try {
      // Use secure server-side coupon validation
      const { data, error } = await supabase.functions.invoke('validate-coupon-secure', {
        body: { 
          code: code.trim().toUpperCase(),
          orderAmount: totalAmount
        }
      });

      if (error || !data?.valid) {
        const errorMessage = error?.message || data?.error || 'Ungültiger Rabattcode';
        toast.error(errorMessage);
        setAppliedCoupon(null);
        return;
      }

      // Set the validated coupon
      setAppliedCoupon(data.coupon);
      toast.success(`Rabattcode angewendet! Sie sparen €${data.discountAmount.toFixed(2)}`);

    } catch (error) {
      console.error('Coupon validation error:', error);
      toast.error('Fehler bei der Validierung des Rabattcodes');
      setAppliedCoupon(null);
    }
  };

  const handleCheckout = () => {
    // Prepare checkout data
    const checkoutData = {
      items,
      totalAmount,
      appliedCoupon,
      discountAmount,
      finalAmount
    };

    // Close modal and navigate to checkout page
    onOpenChange(false);
    navigate('/checkout', { state: { checkoutData } });
  };

  if (items.length === 0) {
    return null;
  }

  if (!supabase) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <Alert>
            <AlertDescription>
              Supabase-Verbindung nicht verfügbar. Bitte versuchen Sie es später erneut.
            </AlertDescription>
          </Alert>
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
            {items.map((item: any) => (
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
                  <span>
                    Rabatt ({appliedCoupon.code})
                    <Badge variant="secondary" className="ml-2">
                         {appliedCoupon.discount_type === 'percentage' 
                           ? `${appliedCoupon.discount_value}%`
                           : `${appliedCoupon.discount_value.toFixed(2)}€`}
                    </Badge>
                  </span>
                  <span>-€{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-base border-t pt-1">
                <span>Gesamt</span>
                <span>€{finalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Coupon Code Input */}
          <div className="space-y-2">
            <Label htmlFor="coupon-code">Rabattcode (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="RABATT10"
              />
              <Button
                type="button"
                onClick={() => validateCoupon(couponCode)}
                disabled={!couponCode.trim()}
                variant="outline"
                size="sm"
              >
                Anwenden
              </Button>
            </div>
            
            {appliedCoupon && (
              <div className="flex items-center justify-between text-sm text-green-600 bg-green-50 p-2 rounded">
                <span>Rabattcode "{appliedCoupon.code}" angewendet</span>
                <Button
                  type="button"
                  onClick={() => {
                    setAppliedCoupon(null);
                    setCouponCode('');
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-green-600 hover:text-green-700 p-1 h-auto"
                >
                  Entfernen
                </Button>
              </div>
            )}
          </div>

          <Button 
            onClick={handleCheckout}
            disabled={loading}
            className="w-full"
            size="lg"
          >
            Zur Kasse gehen (€{finalAmount.toFixed(2)})
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Sie werden zur Checkout-Seite weitergeleitet, wo Sie Ihre Zahlungsart auswählen können.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
