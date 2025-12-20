import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Check, ShoppingCart, Trash2, Sparkles } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

interface ProductVariant {
  id: string;
  name: string;
  productId: string;
  size: string;
  price: string;
  image?: string;
  topNotes?: string[];
  middleNotes?: string[];
  baseNotes?: string[];
  inspiredByFragrance?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image: string | null;
  description?: string;
  variants: ProductVariant[];
}

type SetSize = 3 | 5;

const PRICING: Record<SetSize, number> = {
  3: 129.99,
  5: 199.99,
};

const SAVINGS: Record<SetSize, number> = {
  3: 20,
  5: 50,
};

export default function Sparsets() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSetSize, setSelectedSetSize] = useState<SetSize | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const variants50ml = useMemo(() => {
    if (!products) return [];
    return products.flatMap(product => 
      product.variants
        .filter(v => v.size?.toLowerCase() === '50ml' || v.size?.toLowerCase() === '50 ml')
        .map(v => ({
          ...v,
          productName: product.name,
          productImage: v.image || product.image,
          productCategory: product.category,
          product,
        }))
    );
  }, [products]);

  const handleSelectSetSize = (size: SetSize) => {
    setSelectedSetSize(size);
    setSelectedVariants([]);
  };

  const toggleVariant = (variantId: string) => {
    if (!selectedSetSize) return;
    
    if (selectedVariants.includes(variantId)) {
      setSelectedVariants(prev => prev.filter(id => id !== variantId));
    } else {
      if (selectedVariants.length < selectedSetSize) {
        setSelectedVariants(prev => [...prev, variantId]);
      } else {
        toast({
          title: 'Maximum erreicht',
          description: `Sie können maximal ${selectedSetSize} Flakons auswählen.`,
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedSetSize || selectedVariants.length !== selectedSetSize) {
      toast({
        title: 'Bitte alle Düfte auswählen',
        description: `Wählen Sie ${selectedSetSize} Düfte aus.`,
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const selectedVariantData = selectedVariants.map(id => getVariantById(id)).filter(Boolean);
      const variantNames = selectedVariantData.map(v => v?.name).join(', ');
      const firstVariant = selectedVariantData[0];
      const sortedIds = [...selectedVariants].sort().join('-');
      const bundleKey = `sparset-${selectedSetSize}-${sortedIds}`;
      
      const bundlePerfume = {
        id: bundleKey,
        name: `${selectedSetSize}er Sparset`,
        brand: 'ALDENAIR',
        category: 'Sparset',
        size: `${selectedSetSize} x 50ml`,
        image: firstVariant?.productImage || '',
        description: variantNames,
        variants: [],
      };
      
      const bundleVariant = {
        id: `${bundleKey}-variant`,
        number: `SPARSET-${selectedSetSize}`,
        name: variantNames,
        description: `Enthält: ${variantNames}`,
        size: `${selectedSetSize} x 50ml`,
        price: PRICING[selectedSetSize],
        inStock: true,
      };
      
      addToCart(bundlePerfume, bundleVariant);
      
      toast({
        title: 'Sparset hinzugefügt!',
        description: `Ihr ${selectedSetSize}er Sparset wurde dem Warenkorb hinzugefügt.`,
      });
      navigate('/checkout');
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Konnte nicht zum Warenkorb hinzufügen',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getVariantById = (variantId: string) => {
    return variants50ml.find(v => v.id === variantId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map(i => (
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
              <Package className="w-8 h-8" />
              50ml Sparsets
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sparen Sie mit unseren exklusiven 50ml Sparsets. Wählen Sie 3 oder 5 Ihrer Lieblingsdüfte und profitieren Sie von attraktiven Rabatten.
            </p>
          </div>

          {!selectedSetSize ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              <Card 
                className="hover-elevate cursor-pointer transition-all overflow-hidden"
                onClick={() => handleSelectSetSize(3)}
                data-testid="card-sparset-3"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>3er Sparset</CardTitle>
                  <CardDescription>3 x 50ml Flakons Ihrer Wahl</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-3xl font-bold">{PRICING[3].toFixed(2)}</span>
                    <Badge variant="secondary" className="ml-2">
                      {SAVINGS[3]} sparen
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Statt {(49.99 * 3).toFixed(2)} Einzelpreis
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" data-testid="button-select-sparset-3">
                    3er Set wählen
                  </Button>
                </CardFooter>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer transition-all overflow-hidden border-primary/50"
                onClick={() => handleSelectSetSize(5)}
                data-testid="card-sparset-5"
              >
                <div className="absolute top-4 right-4">
                  <Badge className="bg-primary">Beliebt</Badge>
                </div>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle>5er Sparset</CardTitle>
                  <CardDescription>5 x 50ml Flakons Ihrer Wahl</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="space-y-1">
                    <span className="text-3xl font-bold">{PRICING[5].toFixed(2)}</span>
                    <Badge variant="secondary" className="ml-2">
                      {SAVINGS[5]} sparen
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Statt {(49.99 * 5).toFixed(2)} Einzelpreis
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" data-testid="button-select-sparset-5">
                    5er Set wählen
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedSetSize}er Sparset</h2>
                    <p className="text-muted-foreground">
                      Wählen Sie {selectedSetSize} Düfte ({selectedVariants.length}/{selectedSetSize} ausgewählt)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSetSize(null)}
                    data-testid="button-back-to-selection"
                  >
                    Zurück
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {variants50ml.map(variant => {
                    const isSelected = selectedVariants.includes(variant.id);
                    return (
                      <Card 
                        key={variant.id}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover-elevate'}`}
                        onClick={() => toggleVariant(variant.id)}
                        data-testid={`card-variant-${variant.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {variant.productImage && (
                              <img 
                                src={variant.productImage} 
                                alt={variant.name}
                                className="w-full h-24 object-cover rounded"
                              />
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{variant.name}</p>
                                <p className="text-xs text-muted-foreground">50ml</p>
                                {variant.inspiredByFragrance && (
                                  <p className="text-xs text-primary mt-1 truncate">
                                    Inspiriert von {variant.inspiredByFragrance}
                                  </p>
                                )}
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {variants50ml.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine 50ml Düfte verfügbar. Bitte versuchen Sie es später erneut.
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
                      <p className="text-muted-foreground text-sm">Noch keine Düfte ausgewählt</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedVariants.map(variantId => {
                          const variant = getVariantById(variantId);
                          if (!variant) return null;
                          return (
                            <div key={variantId} className="flex items-center justify-between text-sm gap-2">
                              <span className="truncate flex-1">{variant.name}</span>
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

                    <div className="pt-4 border-t space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Einzelpreis ({selectedSetSize} x 49.99)</span>
                        <span className="line-through">{(49.99 * selectedSetSize).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Sie sparen</span>
                        <span>-{SAVINGS[selectedSetSize].toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                        <span>Gesamt</span>
                        <span>{PRICING[selectedSetSize].toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handleAddToCart}
                      disabled={selectedVariants.length !== selectedSetSize || isAdding}
                      data-testid="button-add-sparset-to-cart"
                    >
                      {isAdding ? (
                        'Wird hinzugefügt...'
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          In den Warenkorb
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
