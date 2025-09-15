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
import { cn } from '@/lib/utils';

// Declare Stripe types for window
declare global {
  interface Window {
    Stripe: any;
  }
}

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
  const [paymentMethod, setPaymentMethod] = useState<'paypal_checkout' | 'paypal_me' | 'bank' | 'sepa' | 'sofort'>('paypal_checkout');
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

      if (paymentMethod === 'paypal_checkout') {
        // Create PayPal order via edge function
        const { data: paypalData, error: paypalError } = await supabase.functions.invoke('create-paypal-payment', {
          body: {
            order_id: newOrderNumber,
            amount: checkoutData.finalAmount,
            currency: 'EUR',
            order_number: newOrderNumber,
            customer_email: user?.email || guestEmail
          }
        });

        if (paypalError) {
          console.error('PayPal Error:', paypalError);
          throw new Error(`PayPal-Zahlung fehlgeschlagen: ${paypalError.message}`);
        }

        // Redirect to PayPal approval URL
        window.location.href = paypalData.approval_url;
        
      } else if (paymentMethod === 'sepa') {
        // Create SEPA payment session
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-sepa-payment', {
          body: {
            items: checkoutData.items,
            customerEmail: user?.email || guestEmail,
            orderNumber: newOrderNumber,
            customerData: customerData
          }
        });

        if (stripeError) {
          console.error('SEPA Error:', stripeError);
          throw new Error(`SEPA-Zahlung fehlgeschlagen: ${stripeError.message}`);
        }

        // Redirect to Stripe checkout
        window.location.href = stripeData.url;
        
      } else if (paymentMethod === 'sofort') {
        // Create Sofort payment session
        const { data: stripeData, error: stripeError } = await supabase.functions.invoke('create-sofort-payment', {
          body: {
            items: checkoutData.items,
            customerEmail: user?.email || guestEmail,
            orderNumber: newOrderNumber
          }
        });

        if (stripeError) {
          console.error('Sofort Error:', stripeError);
          throw new Error(`Sofortüberweisung fehlgeschlagen: ${stripeError.message}`);
        }

        // Redirect to Stripe checkout
        window.location.href = stripeData.url;
        
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
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Zahlungsart
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Premium Payment Options Coming Soon */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                    <h3 className="font-semibold text-primary">🚀 Mehr Zahlungsoptionen bald verfügbar</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Wir arbeiten an der Integration von Kreditkarten, Klarna, Apple Pay und mehr!
                  </p>
                  <p className="text-xs text-primary/80">
                    Für Express-Bestellung mit Kreditkarte: 
                    <a href="mailto:support@aldenairperfumes.de" className="font-medium underline ml-1 hover:text-primary">
                      support@aldenairperfumes.de
                    </a>
                  </p>
                </div>

                <RadioGroup 
                  value={paymentMethod} 
                  onValueChange={(value: 'paypal_checkout' | 'paypal_me' | 'bank' | 'sepa' | 'sofort') => setPaymentMethod(value)}
                  className="space-y-3"
                >
                  {/* PayPal Checkout - Premium Option */}
                  <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    paymentMethod === 'paypal_checkout' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value="paypal_checkout" id="paypal_checkout" />
                      <Label htmlFor="paypal_checkout" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">PP</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">PayPal Checkout</div>
                            <Badge variant="default" className="text-xs bg-green-500 hover:bg-green-600">
                              Empfohlen
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Vollautomatisch • PayPal, Kreditkarte, Lastschrift
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">✓ Sofort</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'paypal_checkout' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Automatische Auftragsverarbeitung nach Zahlung
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SEPA Lastschrift */}
                  <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    paymentMethod === 'sepa' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value="sepa" id="sepa" />
                      <Label htmlFor="sepa" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center">
                          <Banknote className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">SEPA Lastschrift</div>
                            <Badge variant="secondary" className="text-xs">
                              Stammkunden
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Automatischer Einzug • Für Bestandskunden
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">✓ Sofort</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'sepa' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-green-50 dark:bg-green-950/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Mandat wird beim Checkout erteilt
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sofortüberweisung */}
                  <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    paymentMethod === 'sofort' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value="sofort" id="sofort" />
                      <Label htmlFor="sofort" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">Sofortüberweisung</div>
                            <Badge variant="secondary" className="text-xs">
                              Deutsche Banken
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Direkt über Ihr Online-Banking
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-medium">✓ Sofort</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'sofort' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-orange-50 dark:bg-orange-950/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Weiterleitung zu Ihrem Online-Banking
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PayPal.me - Alternative */}
                  <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    paymentMethod === 'paypal_me' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value="paypal_me" id="paypal_me" />
                      <Label htmlFor="paypal_me" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-base">PayPal.me</div>
                            <Badge variant="outline" className="text-xs">
                              Alternative
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Manuelle PayPal-Zahlung
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-blue-600 font-medium">✓ Sofort</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'paypal_me' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-blue-50 dark:bg-blue-950/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Sie werden zu PayPal.me weitergeleitet
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:shadow-lg ${
                    paymentMethod === 'bank' 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }`}>
                    <div className="flex items-center space-x-3 p-4">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="flex items-center gap-3 cursor-pointer flex-1">
                        <div className="w-12 h-12 rounded-xl bg-slate-600 flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-base">Banküberweisung</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            Klassische SEPA-Überweisung • Kostenlos
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-orange-600 font-medium">1-2 Werktage</div>
                        </div>
                      </Label>
                    </div>
                    {paymentMethod === 'bank' && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-orange-50 dark:bg-orange-950/50 rounded-lg p-3 text-sm">
                          <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            Bankdaten werden nach Bestellung angezeigt
                          </div>
                        </div>
                      </div>
                    )}
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

            {/* Enhanced Submit Button */}
            <div className="space-y-4">
              <Button 
                onClick={handleOrderSubmit} 
                disabled={loading} 
                className={cn(
                  "w-full py-6 text-lg font-bold rounded-xl transition-all duration-300",
                  "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary",
                  "shadow-lg hover:shadow-xl hover:shadow-primary/25",
                  "transform hover:scale-[1.02] active:scale-[0.98]",
                  loading && "animate-pulse"
                )}
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Bestellung wird erstellt...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-3">
                    <span>
                      {paymentMethod === 'paypal_checkout' ? `🚀 Mit PayPal bezahlen (${checkoutData.finalAmount.toFixed(2)}€)` : 
                       paymentMethod === 'sepa' ? `💳 SEPA Lastschrift (${checkoutData.finalAmount.toFixed(2)}€)` :
                       paymentMethod === 'sofort' ? `⚡ Sofortüberweisung (${checkoutData.finalAmount.toFixed(2)}€)` :
                       paymentMethod === 'paypal_me' ? `💰 PayPal.me (${checkoutData.finalAmount.toFixed(2)}€)` : 
                       `✨ Bestellung abschließen (${checkoutData.finalAmount.toFixed(2)}€)`
                      }
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <span className="text-sm">→</span>
                    </div>
                  </div>
                )}
              </Button>
              
              {/* Security Notice */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <div className="w-4 h-4 text-green-600">🔒</div>
                <span>Sichere SSL-verschlüsselte Übertragung</span>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                Mit dem Absenden bestätigen Sie unsere AGB und Datenschutzerklärung
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}