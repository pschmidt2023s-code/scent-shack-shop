import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/api';
import { Package, Check, Beaker, ShoppingCart, Trash2 } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

interface SampleSet {
  id: string;
  name: string;
  description: string | null;
  maxSamples: number;
  price: string;
}

interface ProductVariant {
  id: string;
  name: string;
  productId: string;
  size: string;
  price: string;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image: string | null;
  variants: ProductVariant[];
}

export default function SampleSets() {
  const navigate = useNavigate();
  const [selectedSet, setSelectedSet] = useState<SampleSet | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [customerEmail, setCustomerEmail] = useState('');
  const [shippingAddress, setShippingAddress] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Deutschland'
  });

  const { data: sampleSets, isLoading: setsLoading } = useQuery<SampleSet[]>({
    queryKey: ['/api/sample-sets'],
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const orderMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/sample-sets/order', {
        method: 'POST',
        body: JSON.stringify(data),
      }) as Promise<{ orderNumber: string }>;
    },
    onSuccess: (data) => {
      toast({
        title: 'Bestellung erfolgreich!',
        description: `Ihre Bestellung ${data.orderNumber} wurde aufgenommen.`,
      });
      navigate('/');
    },
    onError: (error: any) => {
      toast({
        title: 'Fehler',
        description: error.message || 'Bestellung fehlgeschlagen',
        variant: 'destructive',
      });
    },
  });

  const handleSelectSet = (set: SampleSet) => {
    setSelectedSet(set);
    setSelectedVariants([]);
  };

  const toggleVariant = (variantId: string) => {
    if (!selectedSet) return;
    
    if (selectedVariants.includes(variantId)) {
      setSelectedVariants(prev => prev.filter(id => id !== variantId));
    } else {
      if (selectedVariants.length < selectedSet.maxSamples) {
        setSelectedVariants(prev => [...prev, variantId]);
      } else {
        toast({
          title: 'Maximum erreicht',
          description: `Sie können maximal ${selectedSet.maxSamples} Proben auswählen.`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleOrder = () => {
    if (!selectedSet || selectedVariants.length === 0) {
      toast({
        title: 'Bitte Proben auswählen',
        description: 'Wählen Sie mindestens eine Probe aus.',
        variant: 'destructive',
      });
      return;
    }

    if (!customerEmail || !shippingAddress.firstName || !shippingAddress.street || !shippingAddress.city || !shippingAddress.postalCode) {
      toast({
        title: 'Bitte alle Felder ausfüllen',
        description: 'Füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      });
      return;
    }

    orderMutation.mutate({
      sampleSetId: selectedSet.id,
      variantIds: selectedVariants,
      customerEmail,
      shippingAddress,
    });
  };

  const getVariantById = (variantId: string) => {
    for (const product of products || []) {
      const variant = product.variants.find(v => v.id === variantId);
      if (variant) return { ...variant, productName: product.name, image: product.image };
    }
    return null;
  };

  if (setsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-muted rounded" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
              <Beaker className="w-8 h-8" />
              Probensets
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere exklusiven Düfte mit unseren Probensets. Wählen Sie Ihre Lieblingsdüfte und testen Sie sie bequem zu Hause.
            </p>
          </div>

          {!selectedSet ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sampleSets?.map((set) => (
                <Card 
                  key={set.id} 
                  className="hover-elevate cursor-pointer transition-all"
                  onClick={() => handleSelectSet(set)}
                  data-testid={`card-sample-set-${set.id}`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      {set.name}
                    </CardTitle>
                    <CardDescription>{set.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {set.maxSamples} Proben
                      </Badge>
                      <span className="text-2xl font-bold">{parseFloat(set.price).toFixed(2)}€</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" data-testid={`button-select-set-${set.id}`}>
                      Auswählen
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSet.name}</h2>
                    <p className="text-muted-foreground">
                      Wählen Sie {selectedSet.maxSamples} Düfte ({selectedVariants.length}/{selectedSet.maxSamples} ausgewählt)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSet(null)}
                    data-testid="button-back-to-sets"
                  >
                    Zurück
                  </Button>
                </div>

                {productsLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-32 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products?.flatMap(product => 
                      product.variants.map(variant => {
                        const isSelected = selectedVariants.includes(variant.id);
                        return (
                          <Card 
                            key={variant.id}
                            className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover-elevate'}`}
                            onClick={() => toggleVariant(variant.id)}
                            data-testid={`card-variant-${variant.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                {product.image && (
                                  <img 
                                    src={product.image} 
                                    alt={variant.name}
                                    className="w-12 h-12 object-cover rounded"
                                  />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm truncate">{product.name}</p>
                                  <p className="text-xs text-muted-foreground truncate">{variant.size}</p>
                                </div>
                                {isSelected && (
                                  <Check className="w-5 h-5 text-primary flex-shrink-0" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ihre Auswahl</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedVariants.length === 0 ? (
                      <p className="text-muted-foreground text-sm">Noch keine Proben ausgewählt</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedVariants.map(variantId => {
                          const variant = getVariantById(variantId);
                          if (!variant) return null;
                          return (
                            <div key={variantId} className="flex items-center justify-between text-sm">
                              <span className="truncate flex-1">{variant.productName}</span>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVariant(variantId);
                                }}
                                data-testid={`button-remove-${variantId}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Gesamt</span>
                        <span>{parseFloat(selectedSet.price).toFixed(2)}€</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Lieferadresse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">E-Mail *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="ihre@email.de"
                        data-testid="input-email"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Vorname *</Label>
                        <Input
                          id="firstName"
                          value={shippingAddress.firstName}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, firstName: e.target.value }))}
                          data-testid="input-firstName"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nachname *</Label>
                        <Input
                          id="lastName"
                          value={shippingAddress.lastName}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, lastName: e.target.value }))}
                          data-testid="input-lastName"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="street">Straße *</Label>
                      <Input
                        id="street"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress(prev => ({ ...prev, street: e.target.value }))}
                        data-testid="input-street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="postalCode">PLZ *</Label>
                        <Input
                          id="postalCode"
                          value={shippingAddress.postalCode}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
                          data-testid="input-postalCode"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Stadt *</Label>
                        <Input
                          id="city"
                          value={shippingAddress.city}
                          onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
                          data-testid="input-city"
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handleOrder}
                      disabled={selectedVariants.length === 0 || orderMutation.isPending}
                      data-testid="button-order-samples"
                    >
                      {orderMutation.isPending ? (
                        'Wird bestellt...'
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Probenset bestellen
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
