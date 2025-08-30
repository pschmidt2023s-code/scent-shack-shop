import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Building2, Banknote, Copy, Check } from 'lucide-react';

interface CheckoutData {
  items: any[];
  totalAmount: number;
  appliedCoupon?: any;
  discountAmount: number;
  finalAmount: number;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'bank' | 'card'>('paypal');
  const [guestEmail, setGuestEmail] = useState('');
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Deutschland'
  });
  const [orderNumber, setOrderNumber] = useState('');
  const [copied, setCopied] = useState(false);

  // Get checkout data from location state or calculate from cart
  const checkoutData: CheckoutData = location.state?.checkoutData || {
    items: items,
    totalAmount: total,
    appliedCoupon: null,
    discountAmount: 0,
    finalAmount: total
  };

  useEffect(() => {
    if (checkoutData.items.length === 0) {
      navigate('/');
      return;
    }

    // Generate unique order number using timestamp + random
    const orderNum = 'ADN' + Date.now().toString() + Math.random().toString(36).substr(2, 3).toUpperCase();
    setOrderNumber(orderNum);
  }, [checkoutData.items, navigate]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('In Zwischenablage kopiert');
    setTimeout(() => setCopied(false), 2000);
  };

  const validateForm = () => {
    if (!user && !guestEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse an');
      return false;
    }

    const required = ['firstName', 'lastName', 'street', 'city', 'postalCode'];
    for (const field of required) {
      if (!customerData[field]) {
        toast.error(`Bitte füllen Sie alle Pflichtfelder aus`);
        return false;
      }
    }

    return true;
  };

  const handleOrderSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        guest_email: !user ? guestEmail : null,
        total_amount: Math.round(checkoutData.finalAmount * 100) / 100, // Ensure proper decimal precision
        currency: 'eur',
        payment_method: paymentMethod,
        customer_data: customerData,
        items: checkoutData.items.map(item => ({
           perfume_id: item.perfume?.id || item.id,
           variant_id: item.variant?.id || item.selectedVariant,
           quantity: item.quantity,
           unit_price: Math.round((item.variant?.price || item.price || 0) * 100) / 100,
           total_price: Math.round((item.variant?.price || item.price || 0) * item.quantity * 100) / 100
        })),
         coupon_data: checkoutData.appliedCoupon ? {
           code: checkoutData.appliedCoupon.code,
           discount_amount: Math.round(checkoutData.discountAmount * 100) / 100
         } : null
      };

      console.log("=== ORDER DEBUG ===");
      console.log("Cart items structure:", checkoutData.items);
      console.log("Order data being sent:", orderData);
      
      const { data, error } = await supabase.functions.invoke('create-custom-order', {
        body: orderData
      });

      if (error) throw error;

      // Clear cart and redirect based on payment method
      clearCart();

      if (paymentMethod === 'paypal') {
        // Redirect to PayPal
        if (data.paypal_url) {
          window.location.href = data.paypal_url;
        } else {
          toast.error('PayPal-URL konnte nicht erstellt werden');
        }
      } else if (paymentMethod === 'bank') {
        // Show bank transfer details
        navigate('/checkout-bank', { 
          state: { 
            orderNumber,
            totalAmount: checkoutData.finalAmount,
            bankDetails: {
              recipient: 'Patric-Maurice Schmidt',
              iban: 'DE77100123450827173501',
              bic: 'TRBKDEBBXXX',
              purpose: orderNumber
            }
          }
        });
      }

    } catch (error: any) {
      console.error('Order creation error:', error);
      toast.error('Bestellung konnte nicht erstellt werden: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
          <h1 className="text-3xl font-bold">Kasse</h1>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Bestellübersicht</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checkoutData.items.map((item: any) => (
                 <div key={`${item.perfume?.id || item.id}-${item.variant?.id || item.selectedVariant}`} className="flex justify-between items-start">
                   <div className="flex-1">
                     <h4 className="font-medium">{item.perfume?.name || item.name}</h4>
                     <p className="text-sm text-muted-foreground">{item.perfume?.brand || item.brand}</p>
                     <p className="text-sm text-muted-foreground">Größe: {item.variant?.name || item.selectedVariant}</p>
                     <p className="text-sm text-muted-foreground">Menge: {item.quantity}</p>
                   </div>
                   <p className="font-medium">{((item.variant?.price || item.price) * item.quantity).toFixed(2)}€</p>
                 </div>
               ))}

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Zwischensumme</span>
                  <span>{checkoutData.totalAmount.toFixed(2)}€</span>
                </div>

                {checkoutData.appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>
                      Rabatt ({checkoutData.appliedCoupon.code})
                       <Badge variant="secondary" className="ml-2">
                         {checkoutData.appliedCoupon.discount_type === 'percentage' 
                           ? `${checkoutData.appliedCoupon.discount_value}%`
                           : `${checkoutData.appliedCoupon.discount_value.toFixed(2)}€`}
                       </Badge>
                    </span>
                    <span>-{checkoutData.discountAmount.toFixed(2)}€</span>
                  </div>
                )}

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Gesamt</span>
                  <span>{checkoutData.finalAmount.toFixed(2)}€</span>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Bestellnummer: {orderNumber}</p>
                <p className="text-xs text-muted-foreground">
                  Diese Nummer wird für Ihre Überweisung und Nachverfolgung verwendet.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <div className="space-y-6">
            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Kundendaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <div>
                    <Label htmlFor="guestEmail">E-Mail-Adresse *</Label>
                    <Input
                      id="guestEmail"
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="ihre@email.de"
                      required
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      value={customerData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      value={customerData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Straße und Hausnummer *</Label>
                  <Input
                    id="street"
                    value={customerData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">PLZ *</Label>
                    <Input
                      id="postalCode"
                      value={customerData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefon (optional)</Label>
                  <Input
                    id="phone"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Zahlungsart</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value: 'paypal' | 'bank' | 'card') => setPaymentMethod(value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <div className="font-medium">PayPal</div>
                        <div className="text-sm text-muted-foreground">Kreditkarte, Bankkonto oder PayPal-Guthaben</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Building2 className="w-5 h-5" />
                      <div>
                        <div className="font-medium">Überweisung</div>
                        <div className="text-sm text-muted-foreground">Klassische Banküberweisung</div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === 'bank' && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2">Bankverbindung</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Empfänger:</span>
                        <span className="font-mono">Patric-Maurice Schmidt</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">IBAN:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">DE77100123450827173501</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard('DE77100123450827173501')}
                          >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">BIC:</span>
                        <span className="font-mono">TRBKDEBBXXX</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Verwendungszweck:</span>
                        <span className="font-mono font-bold text-primary">{orderNumber}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      * Bitte geben Sie unbedingt die Bestellnummer als Verwendungszweck an
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button 
              onClick={handleOrderSubmit}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                'Bestellung wird verarbeitet...'
              ) : paymentMethod === 'paypal' ? (
                `Jetzt mit PayPal bezahlen (${checkoutData.finalAmount.toFixed(2)}€)`
              ) : (
                `Bestellung abschicken (${checkoutData.finalAmount.toFixed(2)}€)`
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Mit dem Absenden bestätigen Sie unsere AGB und Datenschutzerklärung
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}