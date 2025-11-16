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
import { ArrowLeft, CreditCard, Building2, Banknote } from 'lucide-react';

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
  const { items, total } = useCart();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'bank' | 'paypal_checkout'>('stripe');
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

    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [checkoutData.items, navigate, searchParams]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!user && !guestEmail) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse an');
      return false;
    }

    const required = ['firstName', 'lastName', 'street', 'city', 'postalCode'];
    for (const field of required) {
      if (!customerData[field]) {
        toast.error('Bitte füllen Sie alle Pflichtfelder aus');
        return false;
      }
    }

    return true;
  };

  const handleStripeCheckout = async (orderNumber: string) => {
    try {
      console.log('🚀 STARTING STRIPE CHECKOUT');
      console.log('📧 Email:', user?.email || guestEmail);
      console.log('🔢 Order:', orderNumber);
      console.log('🛍️ Items:', checkoutData.items.length);
      
      toast.info('Weiterleitung zu Stripe...');
      
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          items: checkoutData.items,
          customerEmail: user?.email || guestEmail,
          orderNumber: orderNumber,
        }
      });

      console.log('📥 Response:', { data, error });

      if (error) {
        console.error('❌ Supabase Error:', error);
        toast.error('Fehler bei der Stripe-Verbindung');
        throw new Error(error.message || 'Stripe-Verbindung fehlgeschlagen');
      }

      if (!data?.url) {
        console.error('❌ No URL:', data);
        toast.error('Keine Zahlungs-URL erhalten');
        throw new Error('Keine Stripe-URL erhalten');
      }

      console.log('✅ Redirecting to Stripe:', data.url);
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('❌ STRIPE ERROR:', error);
      toast.error(error.message || 'Stripe-Checkout fehlgeschlagen');
      throw error;
    }
  };

  const handleOrderSubmit = async () => {
    alert('BUTTON WURDE GEKLICKT!'); // SUPER OFFENSICHTLICHER TEST
    console.log('🔥🔥🔥 BUTTON CLICKED 🔥🔥🔥');
    console.log('Payment Method:', paymentMethod);
    console.log('Customer Data:', customerData);
    console.log('Guest Email:', guestEmail);
    console.log('User:', user);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      alert('FORM VALIDATION FAILED!');
      return;
    }

    alert('FORM VALIDATION PASSED!');
    console.log('✅ Form validation passed');
    setLoading(true);

    try {
      const orderNumber = 'ADN' + Date.now().toString() + Math.random().toString(36).substr(2, 3).toUpperCase();
      console.log('Order number:', orderNumber);
      
      const orderData = {
        order_number: orderNumber,
        user_id: user?.id || null,
        customer_email: user?.email || guestEmail,
        customer_name: `${customerData.firstName} ${customerData.lastName}`,
        customer_phone: customerData.phone,
        shipping_address_data: customerData,
        billing_address_data: customerData,
        total_amount: checkoutData.finalAmount,
        status: 'pending',
      };

      console.log('Creating order in database...');
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        console.error('Order creation error:', orderError);
        throw orderError;
      }

      console.log('Order created:', order.id);

      const orderItems = checkoutData.items.map(item => ({
        order_id: order.id,
        perfume_id: item.perfume?.id || item.id,
        variant_id: item.variant?.id || item.selectedVariant,
        quantity: item.quantity,
        unit_price: item.variant?.price || item.price,
        total_price: (item.variant?.price || item.price) * item.quantity,
      }));

      console.log('Creating order items...');
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) {
        console.error('Order items error:', itemsError);
        throw itemsError;
      }

      console.log('Order items created successfully');
      console.log('Payment method:', paymentMethod);

      if (paymentMethod === 'stripe') {
        console.log('Starting Stripe checkout...');
        await handleStripeCheckout(orderNumber);
      } else if (paymentMethod === 'bank') {
        console.log('Redirecting to bank transfer...');
        
        // Send bank transfer email
        console.log('Sending bank transfer email...');
        const bankDetails = {
          recipient: "ALDENAIR GmbH",
          iban: "DE89 3704 0044 0532 0130 00",
          bic: "COBADEFFXXX",
          bank: "Commerzbank"
        };
        
        try {
          const { error: emailError } = await supabase.functions.invoke('send-bank-transfer-email', {
            body: {
              customerEmail: user?.email || guestEmail,
              customerName: `${customerData.firstName} ${customerData.lastName}`,
              orderNumber: orderNumber,
              totalAmount: checkoutData.finalAmount,
              bankDetails: bankDetails
            }
          });
          
          if (emailError) {
            console.error('Email error:', emailError);
            // Don't block the flow if email fails
          } else {
            console.log('Bank transfer email sent successfully');
          }
        } catch (emailErr) {
          console.error('Email sending failed:', emailErr);
          // Don't block the flow if email fails
        }
        
        navigate('/checkout-bank', { 
          state: { 
            orderNumber,
            orderId: order.id,
            totalAmount: checkoutData.finalAmount,
            customerEmail: user?.email || guestEmail,
            bankDetails: bankDetails
          } 
        });
      } else if (paymentMethod === 'paypal_checkout') {
        console.log('Starting PayPal checkout...');
        const { data: paypalData, error: paypalError } = await supabase.functions.invoke('create-paypal-payment', {
          body: {
            items: checkoutData.items,
            orderId: order.id,
            orderNumber: orderNumber,
            customerEmail: user?.email || guestEmail,
          }
        });

        if (paypalError) {
          console.error('PayPal error:', paypalError);
          throw paypalError;
        }
        if (!paypalData.approvalUrl) {
          console.error('No PayPal approval URL');
          throw new Error('PayPal approval URL missing');
        }
        
        console.log('Redirecting to PayPal:', paypalData.approvalUrl);
        window.location.href = paypalData.approvalUrl;
      }
      
    } catch (error: any) {
      console.error('=== ORDER ERROR ===', error);
      toast.error(error.message || 'Bestellung fehlgeschlagen');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32 lg:pb-8">
          {/* Left Column - Customer Data */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kundendaten</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {!user && (
                  <div>
                    <Label htmlFor="guestEmail">E-Mail*</Label>
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
                    <Label htmlFor="firstName">Vorname*</Label>
                    <Input
                      id="firstName"
                      value={customerData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname*</Label>
                    <Input
                      id="lastName"
                      value={customerData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="street">Straße & Hausnummer*</Label>
                  <Input
                    id="street"
                    value={customerData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">PLZ*</Label>
                    <Input
                      id="postalCode"
                      value={customerData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt*</Label>
                    <Input
                      id="city"
                      value={customerData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zahlungsmethode</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="stripe" id="stripe" />
                    <Label htmlFor="stripe" className="flex items-center cursor-pointer w-full">
                      <CreditCard className="mr-2 h-5 w-5" />
                      <span>Kreditkarte</span>
                      <Badge variant="secondary" className="ml-auto">Empfohlen</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center cursor-pointer w-full">
                      <Building2 className="mr-2 h-5 w-5" />
                      <span>Banküberweisung</span>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent cursor-pointer">
                    <RadioGroupItem value="paypal_checkout" id="paypal_checkout" />
                    <Label htmlFor="paypal_checkout" className="flex items-center cursor-pointer w-full">
                      <Banknote className="mr-2 h-5 w-5" />
                      <span>PayPal</span>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'bank' && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Wichtig:</strong> Bitte geben Sie bei der Überweisung unbedingt die <strong className="text-foreground">Auftragsnummer als Verwendungszweck</strong> an, damit wir Ihre Zahlung korrekt zuordnen können.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sie erhalten nach der Bestellung eine E-Mail mit allen Überweisungsdetails.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle>Bestellübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutData.items.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div className="flex-1 pr-4">
                      <p className="font-medium text-sm">{item.perfume?.name || item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant?.name || item.selectedVariant} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm whitespace-nowrap">
                      {((item.variant?.price || item.price) * item.quantity).toFixed(2)}€
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme</span>
                    <span>{checkoutData.totalAmount.toFixed(2)}€</span>
                  </div>
                  
                  {checkoutData.discountAmount > 0 && (
                    <div className="flex justify-between text-primary text-sm">
                      <span>Rabatt</span>
                      <span>-{checkoutData.discountAmount.toFixed(2)}€</span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between text-base font-bold">
                    <span>Gesamt</span>
                    <span>{checkoutData.finalAmount.toFixed(2)}€</span>
                  </div>
                </div>

                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    console.log('🎯 DIRECT CLICK EVENT');
                    handleOrderSubmit();
                  }}
                  disabled={loading}
                  className="w-full mt-4"
                  size="lg"
                  type="button"
                >
                  {loading ? 'Verarbeitung...' : 'Kostenpflichtig bestellen'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
}
