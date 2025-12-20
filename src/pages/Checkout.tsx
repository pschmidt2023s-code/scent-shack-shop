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
import { useUserRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  ArrowRight, 
  CreditCard, 
  Building2, 
  CheckCircle, 
  Truck, 
  Zap, 
  Percent,
  Mail,
  MapPin,
  Package,
  Check,
  Edit2,
  ShoppingBag
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';

interface ShippingOption {
  id: string;
  name: string;
  description: string | null;
  price: string;
  estimatedDays: string | null;
  isExpress: boolean;
}

interface CheckoutData {
  items: any[];
  totalAmount: number;
  appliedCoupon?: any;
  discountAmount: number;
  finalAmount: number;
}

type CheckoutStep = 'contact' | 'address' | 'shipping' | 'payment' | 'review';

const STEPS: { id: CheckoutStep; label: string; icon: any }[] = [
  { id: 'contact', label: 'Kontakt', icon: Mail },
  { id: 'address', label: 'Adresse', icon: MapPin },
  { id: 'shipping', label: 'Versand', icon: Truck },
  { id: 'payment', label: 'Zahlung', icon: CreditCard },
  { id: 'review', label: 'Prüfen', icon: Check },
];

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { discount: tierDiscount, roleLabel, isNewsletterSubscriber } = useUserRole();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
  const [selectedShipping, setSelectedShipping] = useState<string>('');
  const [guestEmail, setGuestEmail] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [orderTotal, setOrderTotal] = useState(0);
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

  const { data: shippingOptions = [] } = useQuery<ShippingOption[]>({
    queryKey: ['/api/shipping-options'],
  });

  const { data: bankDetails } = useQuery<{
    recipient: string;
    iban: string;
    bic: string;
    bankName: string;
  }>({
    queryKey: ['/api/settings/bank'],
  });

  const { data: savedAddresses = [] } = useQuery<any[]>({
    queryKey: ['/api/addresses'],
    enabled: !!user,
  });

  const { data: userProfile } = useQuery<any>({
    queryKey: ['/api/profile'],
    enabled: !!user,
  });

  const [checkoutData] = useState<CheckoutData>(() => location.state?.checkoutData || {
    items: items,
    totalAmount: total,
    appliedCoupon: null,
    discountAmount: 0,
    finalAmount: total
  });

  const selectedShippingOption = shippingOptions.find(opt => opt.id === selectedShipping);
  const shippingCost = selectedShippingOption ? parseFloat(selectedShippingOption.price) : 0;
  const freeShippingThreshold = 50;
  const qualifiesForFreeStandard = checkoutData.totalAmount >= freeShippingThreshold;
  
  const tierDiscountAmount = tierDiscount > 0 ? (checkoutData.totalAmount * tierDiscount / 100) : 0;
  const totalDiscountAmount = checkoutData.discountAmount + tierDiscountAmount;
  const subtotalAfterDiscount = checkoutData.totalAmount - totalDiscountAmount;
  const actualShippingCost = qualifiesForFreeStandard && !selectedShippingOption?.isExpress ? 0 : shippingCost;
  const finalTotal = subtotalAfterDiscount + actualShippingCost;

  useEffect(() => {
    if (shippingOptions.length > 0 && !selectedShipping) {
      const standardOption = shippingOptions.find(opt => !opt.isExpress);
      if (standardOption) {
        setSelectedShipping(standardOption.id);
      }
    }
  }, [shippingOptions, selectedShipping]);

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
    }
  }, [searchParams]);

  useEffect(() => {
    if (checkoutData.items.length === 0 && !orderSuccess) {
      navigate('/');
    }
  }, []);

  useEffect(() => {
    if (user?.email) {
      setCustomerData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  useEffect(() => {
    if (user && savedAddresses.length > 0) {
      const defaultAddress = savedAddresses.find((addr: any) => addr.isDefault) || savedAddresses[0];
      if (defaultAddress) {
        setCustomerData(prev => ({
          ...prev,
          firstName: defaultAddress.firstName || prev.firstName,
          lastName: defaultAddress.lastName || prev.lastName,
          street: defaultAddress.street || prev.street,
          city: defaultAddress.city || prev.city,
          postalCode: defaultAddress.postalCode || prev.postalCode,
          country: defaultAddress.country || prev.country,
          phone: defaultAddress.phone || prev.phone,
        }));
      }
    }
  }, [user, savedAddresses]);

  useEffect(() => {
    if (userProfile && !savedAddresses.length) {
      setCustomerData(prev => ({
        ...prev,
        firstName: userProfile.firstName || prev.firstName,
        lastName: userProfile.lastName || prev.lastName,
        phone: userProfile.phone || prev.phone,
      }));
    }
  }, [userProfile, savedAddresses.length]);

  const handleInputChange = (field: string, value: string) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
  };

  const currentStepIndex = STEPS.findIndex(s => s.id === currentStep);

  const validateContactStep = () => {
    const email = user?.email || guestEmail;
    if (!email) {
      toast.error('Bitte geben Sie eine E-Mail-Adresse an');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return false;
    }
    return true;
  };

  const validateAddressStep = () => {
    const required = ['firstName', 'lastName', 'street', 'city', 'postalCode'];
    const fieldNames: Record<string, string> = {
      firstName: 'Vorname',
      lastName: 'Nachname',
      street: 'Straße',
      city: 'Stadt',
      postalCode: 'PLZ'
    };
    for (const field of required) {
      if (!(customerData as any)[field]) {
        toast.error(`Bitte füllen Sie das Feld "${fieldNames[field]}" aus`);
        return false;
      }
    }
    return true;
  };

  const validateShippingStep = () => {
    if (!selectedShipping) {
      toast.error('Bitte wählen Sie eine Versandoption');
      return false;
    }
    return true;
  };

  const goToNextStep = () => {
    if (currentStep === 'contact' && !validateContactStep()) return;
    if (currentStep === 'address' && !validateAddressStep()) return;
    if (currentStep === 'shipping' && !validateShippingStep()) return;
    
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex].id);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex].id);
    }
  };

  const goToStep = (step: CheckoutStep) => {
    const stepIndex = STEPS.findIndex(s => s.id === step);
    if (stepIndex <= currentStepIndex) {
      setCurrentStep(step);
    }
  };

  const handleOrderSubmit = async () => {
    setLoading(true);

    try {
      const orderItems = checkoutData.items.map(item => ({
        perfumeId: item.perfume?.id || item.id,
        variantId: item.variant?.id || item.selectedVariant,
        quantity: item.quantity,
      }));
      
      if (paymentMethod === 'card') {
        const stripeItems = checkoutData.items.map(item => ({
          variantId: item.variant?.id || item.selectedVariant,
          quantity: item.quantity,
        }));
        
        const stripeResponse = await fetch('/api/stripe/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            items: stripeItems,
            customerEmail: user?.email || guestEmail,
            shippingAddress: customerData,
            shippingCost: actualShippingCost,
            shippingOptionName: selectedShippingOption?.name || 'Versand',
            discountAmount: totalDiscountAmount,
          }),
        });
        
        if (!stripeResponse.ok) {
          const error = await stripeResponse.json();
          throw new Error(error.error || 'Stripe Checkout fehlgeschlagen');
        }
        
        const responseData = await stripeResponse.json();
        const { url } = responseData;
        if (url) {
          try {
            if (window.top && window.top !== window) {
              window.top.location.href = url;
            } else {
              window.location.href = url;
            }
          } catch (redirectError) {
            window.open(url, '_blank');
          }
          return;
        }
        throw new Error('Keine Checkout-URL erhalten');
      }
      
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
          discountAmount: totalDiscountAmount,
          shippingOptionId: selectedShipping || undefined,
          shippingCost: actualShippingCost,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bestellung fehlgeschlagen');
      }

      const order = await response.json();
      
      setOrderNumber(order.orderNumber);
      setOrderTotal(parseFloat(order.totalAmount));
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
                    <p><span className="text-muted-foreground">Empfänger:</span> {bankDetails?.recipient || 'ALDENAIR'}</p>
                    <p><span className="text-muted-foreground">IBAN:</span> {bankDetails?.iban || 'Wird geladen...'}</p>
                    {bankDetails?.bic && <p><span className="text-muted-foreground">BIC:</span> {bankDetails.bic}</p>}
                    <p><span className="text-muted-foreground">Verwendungszweck:</span> {orderNumber}</p>
                    <p><span className="text-muted-foreground">Betrag:</span> {orderTotal.toFixed(2)} EUR</p>
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

  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-primary -z-10 transition-all duration-300"
          style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
        />
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isClickable = index <= currentStepIndex;
          
          return (
            <button
              key={step.id}
              onClick={() => isClickable && goToStep(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex flex-col items-center gap-2 transition-all",
                isClickable ? "cursor-pointer" : "cursor-not-allowed opacity-50"
              )}
              data-testid={`step-${step.id}`}
            >
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all bg-background",
                isCompleted && "bg-primary border-primary text-primary-foreground",
                isCurrent && "border-primary text-primary",
                !isCompleted && !isCurrent && "border-muted-foreground/30 text-muted-foreground"
              )}>
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>
              <span className={cn(
                "text-xs font-medium hidden sm:block",
                (isCompleted || isCurrent) ? "text-foreground" : "text-muted-foreground"
              )}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );


  const OrderSummary = () => (
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
          
          {tierDiscount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span className="flex items-center gap-1">
                <Percent className="w-3 h-3" />
                {roleLabel} Rabatt ({tierDiscount}%)
              </span>
              <span>-{tierDiscountAmount.toFixed(2)} €</span>
            </div>
          )}
          
          {checkoutData.discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
              <span>Gutschein Rabatt</span>
              <span>-{checkoutData.discountAmount.toFixed(2)} €</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span>
              Versand {selectedShippingOption ? `(${selectedShippingOption.name})` : ''}
            </span>
            {actualShippingCost === 0 ? (
              <span className="text-green-600 dark:text-green-400">Kostenlos</span>
            ) : (
              <span>{actualShippingCost.toFixed(2)} €</span>
            )}
          </div>

          <Separator />

          <div className="flex justify-between text-lg font-bold">
            <span>Gesamt</span>
            <span>{finalTotal.toFixed(2)} €</span>
          </div>
        </div>

        {currentStep === 'review' && (
          <>
            <Button
              onClick={handleOrderSubmit}
              disabled={loading}
              className="w-full mt-4"
              size="lg"
              data-testid="button-submit-order"
            >
              {loading ? 'Verarbeitung...' : 'Kostenpflichtig bestellen'}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              Mit Klick auf "Kostenpflichtig bestellen" akzeptieren Sie unsere AGB und Datenschutzbestimmungen.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'contact': 
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Kontaktdaten
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {user ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Angemeldet als</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              ) : (
                <div>
                  <Label htmlFor="guestEmail">E-Mail-Adresse *</Label>
                  <Input
                    id="guestEmail"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="ihre@email.de"
                    data-testid="input-email"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Bestellbestätigung wird an diese Adresse gesendet
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'address': 
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Lieferadresse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Vorname *</Label>
                    <Input
                      id="firstName"
                      type="text"
                      autoComplete="given-name"
                      value={customerData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      data-testid="input-firstname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nachname *</Label>
                    <Input
                      id="lastName"
                      type="text"
                      autoComplete="family-name"
                      value={customerData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      data-testid="input-lastname"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="street">Straße & Hausnummer *</Label>
                  <Input
                    id="street"
                    type="text"
                    autoComplete="street-address"
                    value={customerData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    data-testid="input-street"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">PLZ *</Label>
                    <Input
                      id="postalCode"
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      value={customerData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      data-testid="input-postalcode"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Stadt *</Label>
                    <Input
                      id="city"
                      type="text"
                      autoComplete="address-level2"
                      value={customerData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      data-testid="input-city"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="phone">Telefon (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    data-testid="input-phone"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        );
      case 'shipping': 
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Versandmethode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                {shippingOptions.map((option) => {
                  const isStandard = !option.isExpress;
                  const isFree = isStandard && qualifiesForFreeStandard;
                  return (
                    <div 
                      key={option.id} 
                      className={cn(
                        "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                        selectedShipping === option.id ? "border-primary bg-primary/5" : "hover-elevate"
                      )}
                      onClick={() => setSelectedShipping(option.id)}
                    >
                      <RadioGroupItem value={option.id} id={`shipping-${option.id}`} />
                      <Label htmlFor={`shipping-${option.id}`} className="flex items-center cursor-pointer w-full">
                        {option.isExpress ? (
                          <Zap className="mr-3 h-5 w-5 text-amber-500" />
                        ) : (
                          <Truck className="mr-3 h-5 w-5" />
                        )}
                        <div className="flex-1">
                          <span className="font-medium">{option.name}</span>
                          <p className="text-xs text-muted-foreground">{option.estimatedDays}</p>
                        </div>
                        <div className="text-right">
                          {isFree ? (
                            <span className="text-green-600 dark:text-green-400 font-medium">Kostenlos</span>
                          ) : (
                            <span className="font-medium">{parseFloat(option.price).toFixed(2)} €</span>
                          )}
                          {option.isExpress && (
                            <Badge variant="secondary" className="ml-2">Express</Badge>
                          )}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
              {!qualifiesForFreeStandard && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Noch {(freeShippingThreshold - checkoutData.totalAmount).toFixed(2)} € bis zum kostenlosen Standardversand
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'payment': 
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Zahlungsmethode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
                <div 
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                    paymentMethod === 'bank' ? "border-primary bg-primary/5" : "hover-elevate"
                  )}
                  onClick={() => setPaymentMethod('bank')}
                >
                  <RadioGroupItem value="bank" id="bank" />
                  <Label htmlFor="bank" className="flex items-center cursor-pointer w-full">
                    <Building2 className="mr-3 h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium">Banküberweisung (Vorkasse)</span>
                      <p className="text-xs text-muted-foreground">Bezahlen Sie sicher per Überweisung</p>
                    </div>
                  </Label>
                </div>
                <div 
                  className={cn(
                    "flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-all",
                    paymentMethod === 'card' ? "border-primary bg-primary/5" : "hover-elevate"
                  )}
                  onClick={() => setPaymentMethod('card')}
                >
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center cursor-pointer w-full">
                    <CreditCard className="mr-3 h-5 w-5" />
                    <div className="flex-1">
                      <span className="font-medium">Kreditkarte / Debitkarte</span>
                      <p className="text-xs text-muted-foreground">Sichere Zahlung via Stripe</p>
                    </div>
                    <Badge variant="secondary">Stripe</Badge>
                  </Label>
                </div>
              </RadioGroup>
              {paymentMethod === 'bank' && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/50 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-900 dark:text-amber-100">
                    Nach Abschluss der Bestellung erhalten Sie die Bankdaten zur Überweisung. Ihre Bestellung wird nach Zahlungseingang versendet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      case 'review': 
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Bestellung prüfen
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Kontakt
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => goToStep('contact')}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{user?.email || guestEmail}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lieferadresse
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => goToStep('address')}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {customerData.firstName} {customerData.lastName}<br />
                    {customerData.street}<br />
                    {customerData.postalCode} {customerData.city}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Versand
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => goToStep('shipping')}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedShippingOption?.name} 
                    {actualShippingCost === 0 ? ' (Kostenlos)' : ` (${actualShippingCost.toFixed(2)} €)`}
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Zahlung
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => goToStep('payment')}>
                      <Edit2 className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {paymentMethod === 'bank' ? 'Banküberweisung (Vorkasse)' : 'Kreditkarte / Debitkarte'}
                  </p>
                </div>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  Artikel ({checkoutData.items.length})
                </h4>
                <div className="space-y-3">
                  {checkoutData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center gap-4 p-3 bg-muted/50 rounded-lg">
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
                </div>
              </div>
            </CardContent>
          </Card>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 pb-32 md:pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => currentStepIndex === 0 ? navigate('/') : goToPrevStep()}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {currentStepIndex === 0 ? 'Zurück zum Shop' : 'Zurück'}
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">Kasse</h1>
        <p className="text-muted-foreground mb-6">
          Schritt {currentStepIndex + 1} von {STEPS.length}: {STEPS[currentStepIndex].label}
        </p>

        <StepIndicator />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {renderCurrentStep()}

            <div className="flex justify-between gap-4">
              {currentStepIndex > 0 && (
                <Button
                  variant="outline"
                  onClick={goToPrevStep}
                  data-testid="button-prev-step"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Zurück
                </Button>
              )}
              
              {currentStep !== 'review' && (
                <Button
                  onClick={goToNextStep}
                  className="ml-auto"
                  data-testid="button-next-step"
                >
                  Weiter
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="order-first lg:order-last">
            <OrderSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
