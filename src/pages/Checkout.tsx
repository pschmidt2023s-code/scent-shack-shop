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
import { toast } from 'sonner';
import { ArrowLeft, CreditCard, Building2, Banknote, CheckCircle } from 'lucide-react';

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
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
  const [guestEmail, setGuestEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
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
    if (checkoutData.items.length === 0 && !orderSuccess) {
      navigate('/');
      return;
    }

    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [checkoutData.items, navigate, searchParams, orderSuccess]);

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
      if (!(customerData as any)[field]) {
        const fieldNames: any = {
          firstName: 'Vorname',
          lastName: 'Nachname',
          street: 'Straße',
          city: 'Stadt',
          postalCode: 'PLZ'
        };
        toast.error(`Bitte füllen Sie das Feld "${fieldNames[field]}" aus`);
        return false;
      }
    }

    return true;
  };

  const handleOrderSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const orderItems = checkoutData.items.map(item => ({
        perfumeId: item.perfume?.id || item.id,
        variantId: item.variant?.id || item.selectedVariant,
        quantity: item.quantity,
      }));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          items: orderItems,
          customerName: `${customerData.firstName} ${customerData.lastName}`,
          customerEmail: user?.email || guestEmail,
          customerPhone: customerData.phone,
          shippingAddressData: customerData,
          billingAddressData: customerData,
          paymentMethod: paymentMethod,
          referralCode: referralCode || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bestellung fehlgeschlagen');
      }

      const order = await response.json();
      
      setOrderNumber(order.orderNumber);
      setOrderSuccess(true);
      clearCart();
      toast.success('Bestellung erfolgreich aufgegeben!');
      
    } catch (error: any) {
      console.error('Order error:', error);
      toast.error(error.message || 'Bestellung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="text-center py-12">
            <CardContent className="space-y-6">
              <CheckCircle className="w-20 h-20 mx-auto text-green-500" />
              <h1 className="text-3xl font-bold">Vielen Dank für Ihre Bestellung!</h1>
              <p className="text-muted-foreground text-lg">
                Ihre Bestellnummer: <span className="font-mono font-bold text-foreground">{orderNumber}</span>
              </p>
              
              {paymentMethod === 'bank' && (
                <div className="bg-muted p-6 rounded-lg text-left space-y-4">
                  <h3 className="font-semibold text-lg">Banküberweisung</h3>
                  <p className="text-sm text-muted-foreground">
                    Bitte überweisen Sie den Betrag an folgendes Konto:
                  </p>
                  <div className="space-y-2 font-mono text-sm">
                    <p><span className="text-muted-foreground">Empfänger:</span> ALDENAIR GmbH</p>
                    <p><span className="text-muted-foreground">IBAN:</span> DE89 3704 0044 0532 0130 00</p>
                    <p><span className="text-muted-foreground">BIC:</span> COBADEFFXXX</p>
                    <p><span className="text-muted-foreground">Verwendungszweck:</span> {orderNumber}</p>
                    <p><span className="text-muted-foreground">Betrag:</span> {checkoutData.finalAmount.toFixed(2)} €</p>
                  </div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    Wichtig: Bitte geben Sie unbedingt die Bestellnummer als Verwendungszweck an!
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button onClick={() => navigate('/')} variant="outline">
                  Zurück zur Startseite
                </Button>
                <Button onClick={() => navigate('/profile')}>
                  Meine Bestellungen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 pb-32 md:pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-6">Kasse</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kundendaten</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  {!user && (
                    <div>
                      <Label htmlFor="guestEmail">E-Mail *</Label>
                      <Input
                        id="guestEmail"
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        enterKeyHint="next"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="ihre@email.de"
                        required
                        data-testid="input-email"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Vorname *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        autoComplete="given-name"
                        enterKeyHint="next"
                        value={customerData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        required
                        data-testid="input-firstname"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Nachname *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        autoComplete="family-name"
                        enterKeyHint="next"
                        value={customerData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        required
                        data-testid="input-lastname"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="street">Straße & Hausnummer *</Label>
                    <Input
                      id="street"
                      name="street"
                      type="text"
                      autoComplete="street-address"
                      enterKeyHint="next"
                      value={customerData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      required
                      data-testid="input-street"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">PLZ *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        enterKeyHint="next"
                        value={customerData.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        required
                        data-testid="input-postalcode"
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Stadt *</Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        autoComplete="address-level2"
                        enterKeyHint="next"
                        value={customerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                        data-testid="input-city"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone">Telefon (optional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      enterKeyHint="done"
                      value={customerData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      data-testid="input-phone"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zahlungsmethode</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate">
                    <RadioGroupItem value="bank" id="bank" />
                    <Label htmlFor="bank" className="flex items-center cursor-pointer w-full">
                      <Building2 className="mr-3 h-5 w-5" />
                      <span>Banküberweisung</span>
                      <Badge variant="secondary" className="ml-auto">Sicher</Badge>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover-elevate opacity-50">
                    <RadioGroupItem value="card" id="card" disabled />
                    <Label htmlFor="card" className="flex items-center cursor-pointer w-full">
                      <CreditCard className="mr-3 h-5 w-5" />
                      <span>Kreditkarte</span>
                      <Badge variant="outline" className="ml-auto">Bald verfügbar</Badge>
                    </Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'bank' && (
                  <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      Nach Abschluss der Bestellung erhalten Sie die Bankdaten zur Überweisung.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="lg:sticky lg:top-8">
              <CardHeader>
                <CardTitle>Bestellübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkoutData.items.map((item, index) => (
                  <div key={index} className="flex justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.perfume?.name || item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.variant?.name || item.selectedVariant} x {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-sm whitespace-nowrap">
                      {((item.variant?.price || item.price) * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Zwischensumme</span>
                    <span>{checkoutData.totalAmount.toFixed(2)} €</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Versand</span>
                    <span className="text-green-600 dark:text-green-400">Kostenlos</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Gesamt</span>
                    <span>{checkoutData.finalAmount.toFixed(2)} €</span>
                  </div>
                </div>

                <Button
                  onClick={handleOrderSubmit}
                  disabled={loading}
                  className="w-full mt-4"
                  size="lg"
                  type="button"
                  data-testid="button-submit-order"
                >
                  {loading ? 'Verarbeitung...' : 'Kostenpflichtig bestellen'}
                </Button>
                
                <p className="text-xs text-muted-foreground text-center">
                  Mit Klick auf "Kostenpflichtig bestellen" akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
