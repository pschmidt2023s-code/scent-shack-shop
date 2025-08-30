import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'paypal_me' | 'bank' | 'stripe'>('stripe');
  const [guestEmail, setGuestEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
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

    // Check for referral code in URL
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      console.log('Referral code detected:', refCode);
    }
  }, [checkoutData.items, navigate, searchParams]);

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
      // Generate new order number for each submission to avoid duplicates
      const newOrderNumber = 'ADN' + Date.now().toString() + Math.random().toString(36).substr(2, 3).toUpperCase();
      console.log('Generated new order number:', newOrderNumber);
      
      const orderData = {
        order_number: newOrderNumber,
        user_id: user?.id || null,
        guest_email: !user ? guestEmail : null,
        total_amount: Math.round(checkoutData.finalAmount * 100) / 100, // Ensure proper decimal precision
        currency: 'eur',
        payment_method: paymentMethod,
        referral_code: referralCode || null,
        customer_data: {
          ...customerData,
          email: user?.email || guestEmail || customerData.email
        },
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

      console.log("Order created successfully, payment method:", paymentMethod);

      if (paymentMethod === 'stripe') {
        console.log("Processing Stripe payment...");
        
        // Direct Stripe Checkout redirect without Edge Function
        try {
          console.log("Using existing create-stripe-checkout function...");
          
          const { data: stripeData } = await supabase.functions.invoke('create-stripe-checkout', {
            body: {
              amount: checkoutData.finalAmount,
              stripeKey: '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' // Ihr Live Secret Key
            }
          });
          
          if (stripeData?.url) {
            console.log("Stripe session created, redirecting...");
            window.location.href = stripeData.url;
          } else {
            throw new Error(stripeData?.error || 'Stripe session creation failed');
          }
          
        } catch (stripeError) {
          console.error("Stripe session creation failed:", stripeError);
          toast.error('Stripe-Zahlung fehlgeschlagen. Versuchen Sie PayPal oder Überweisung.');
        }
      } else if (paymentMethod === 'paypal') {
        // Redirect to PayPal
        console.log('PayPal payment data received:', data);
        if (data?.paypal_url) {
          window.location.href = data.paypal_url;
        } else {
          console.error('PayPal response:', data);
          toast.error('PayPal-Fehler: ' + (data?.error || 'Unbekannter Fehler') + '. Probieren Sie bitte PayPal.me oder Überweisung.');
          setPaymentMethod('paypal_me'); // Fallback to PayPal.me
        }
      } else if (paymentMethod === 'paypal_me') {
        // Direct PayPal.me link
        const paypalMeUrl = `https://paypal.me/threed48/${checkoutData.finalAmount.toFixed(2)}EUR`;
        console.log('Opening PayPal.me link:', paypalMeUrl);
        window.open(paypalMeUrl, '_blank');
        
        // Show success page for PayPal.me
        navigate('/checkout-success', { 
          state: { 
            orderNumber: newOrderNumber,
            paymentMethod: 'paypal_me',
            totalAmount: checkoutData.finalAmount 
          }
        });
      } else if (paymentMethod === 'bank') {
        // Show bank transfer details
        navigate('/checkout-bank', { 
          state: { 
            orderNumber: newOrderNumber,
            totalAmount: checkoutData.finalAmount,
            bankDetails: {
              recipient: 'Patric-Maurice Schmidt',
              iban: 'DE77100123450827173501',
              bic: 'TRBKDEBBXXX',
              purpose: newOrderNumber
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

              {/* Cashback Info */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 rounded-lg border border-primary/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-primary">💰 Cashback erhalten</span>
                  <span className="text-lg font-bold text-primary">
                    {(checkoutData.finalAmount * 0.05).toFixed(2)}€
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Sie erhalten 5% Cashback auf diese Bestellung. {!user && "Melden Sie sich nach der Bestellung mit Ihrer E-Mail an, um den Cashback zu erhalten."}
                </p>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Ihre Bestellnummer wird nach dem Absenden generiert</p>
                <p className="text-xs text-muted-foreground">
                  Diese wird für Ihre Überweisung und Nachverfolgung verwendet.
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
                  onValueChange={(value: 'paypal' | 'paypal_me' | 'bank' | 'stripe') => setPaymentMethod(value)}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Stripe (Empfohlen)</div>
                        <div className="text-sm text-muted-foreground">Kreditkarte, SEPA, Apple Pay, Google Pay</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="paypal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5" />
                      <div>
                        <div className="font-medium">PayPal (Standard)</div>
                        <div className="text-sm text-muted-foreground">Kreditkarte, Bankkonto oder PayPal-Guthaben</div>
                      </div>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/50">
                    <RadioGroupItem value="paypal_me" id="paypal_me" />
                    <Label htmlFor="paypal_me" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">PayPal.me</div>
                        <div className="text-sm text-muted-foreground">Direkte PayPal-Zahlung mit automatischem Betrag</div>
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
                        <span className="text-sm text-muted-foreground">Wird nach Bestellung angezeigt</span>
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
              ) : paymentMethod === 'stripe' ? (
                `Mit Stripe bezahlen (${checkoutData.finalAmount.toFixed(2)}€)`
              ) : paymentMethod === 'paypal' ? (
                `Jetzt mit PayPal bezahlen (${checkoutData.finalAmount.toFixed(2)}€)`
              ) : paymentMethod === 'paypal_me' ? (
                `Mit PayPal.me bezahlen (${checkoutData.finalAmount.toFixed(2)}€)`
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