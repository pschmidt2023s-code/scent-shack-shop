import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Package, Check, Beaker, ShoppingCart, Trash2, Sparkles, RefreshCw } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';

import mensSampleSet from '@/assets/sample-sets/mens_perfume_sample_set.png';
import womensSampleSet from '@/assets/sample-sets/womens_perfume_sample_set.png';
import bestsellerSampleSet from '@/assets/sample-sets/bestseller_perfume_sample_set.png';

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
}

interface Product {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  image: string | null;
  variants: ProductVariant[];
}

type SetType = 'bestseller' | 'individual';

const SAMPLE_SET_PRICE = 29.95;

export default function SampleSets() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSetType, setSelectedSetType] = useState<SetType | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<string[]>([]);
  const [bestsellerVariants, setBestsellerVariants] = useState<string[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const sampleVariants = useMemo(() => {
    if (!products) return [];
    return products.flatMap(product => 
      product.variants
        .filter(v => v.size?.toLowerCase() === '5ml')
        .map(v => ({
          ...v,
          productName: product.name,
          productImage: v.image || product.image,
          productCategory: product.category,
        }))
    );
  }, [products]);

  useEffect(() => {
    if (sampleVariants.length >= 5 && bestsellerVariants.length === 0) {
      generateBestsellerSet();
    }
  }, [sampleVariants]);

  const generateBestsellerSet = () => {
    if (sampleVariants.length < 5) return;
    const shuffled = [...sampleVariants].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5).map(v => v.id);
    setBestsellerVariants(selected);
  };

  const getVariantData = (variantId: string) => {
    return sampleVariants.find(v => v.id === variantId);
  };

  const handleSelectSetType = (type: SetType) => {
    setSelectedSetType(type);
    if (type === 'bestseller') {
      setSelectedVariants([...bestsellerVariants]);
    } else {
      setSelectedVariants([]);
    }
  };

  const toggleVariant = (variantId: string) => {
    if (selectedSetType !== 'individual') return;
    
    if (selectedVariants.includes(variantId)) {
      setSelectedVariants(prev => prev.filter(id => id !== variantId));
    } else {
      if (selectedVariants.length < 5) {
        setSelectedVariants(prev => [...prev, variantId]);
      } else {
        toast({
          title: 'Maximum erreicht',
          description: 'Sie können maximal 5 Proben auswählen.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleAddToCart = () => {
    if (selectedVariants.length !== 5) {
      toast({
        title: 'Bitte 5 Proben auswählen',
        description: 'Wählen Sie genau 5 Proben aus.',
        variant: 'destructive',
      });
      return;
    }

    setIsAdding(true);
    try {
      const selectedVariantData = selectedVariants.map(id => getVariantData(id)).filter(Boolean);
      const variantNames = selectedVariantData.map(v => v?.name).join(', ');
      const firstVariant = selectedVariantData[0];
      const sortedIds = [...selectedVariants].sort().join('-');
      const bundleKey = `probenset-${selectedSetType}-${sortedIds}`;
      
      const setTypeLabel = selectedSetType === 'bestseller' ? 'Bestseller' : 'Individuelles';
      
      const bundlePerfume = {
        id: bundleKey,
        name: `${setTypeLabel} Probenset`,
        brand: 'ALDENAIR',
        category: 'Probenset',
        size: '5 x 5ml',
        image: firstVariant?.productImage || '',
        description: variantNames,
        variants: [],
      };
      
      const bundleVariant = {
        id: `${bundleKey}-variant`,
        number: 'PROBENSET-5',
        name: variantNames,
        description: `Enthält: ${variantNames}`,
        size: '5 x 5ml',
        price: SAMPLE_SET_PRICE,
        inStock: true,
      };
      
      addToCart(bundlePerfume, bundleVariant);
      
      toast({
        title: 'Probenset hinzugefügt!',
        description: 'Ihr 5er Probenset wurde dem Warenkorb hinzugefügt.',
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
    return sampleVariants.find(v => v.id === variantId);
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
              <Beaker className="w-8 h-8" />
              5er Probensets
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Entdecken Sie unsere exklusiven Düfte mit 5ml Proben. Wählen Sie zwischen unserem monatlich wechselnden Bestseller-Set oder stellen Sie Ihr individuelles Set zusammen.
            </p>
          </div>

          {!selectedSetType ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Card 
                className="hover-elevate cursor-pointer transition-all overflow-hidden"
                onClick={() => handleSelectSetType('bestseller')}
                data-testid="card-bestseller-set"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={bestsellerSampleSet} 
                    alt="Bestseller Probenset"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-primary">Monatlich neu</Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Bestseller Probenset
                  </CardTitle>
                  <CardDescription>
                    5 handverlesene Bestseller-Düfte - jeden Monat eine neue Überraschung
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">5 Proben</Badge>
                    <span className="text-2xl font-bold">{SAMPLE_SET_PRICE.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" data-testid="button-select-bestseller">
                    Bestseller-Set wählen
                  </Button>
                </CardFooter>
              </Card>

              <Card 
                className="hover-elevate cursor-pointer transition-all overflow-hidden"
                onClick={() => handleSelectSetType('individual')}
                data-testid="card-individual-set"
              >
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={mensSampleSet} 
                    alt="Individuelles Probenset"
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Individuelles Probenset
                  </CardTitle>
                  <CardDescription>
                    Stellen Sie Ihr eigenes Set aus allen verfügbaren Proben zusammen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">5 Proben</Badge>
                    <span className="text-2xl font-bold">{SAMPLE_SET_PRICE.toFixed(2)}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" data-testid="button-select-individual">
                    Eigenes Set zusammenstellen
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ) : selectedSetType === 'bestseller' ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Bestseller Probenset
                  </h2>
                  <p className="text-muted-foreground">
                    Diesen Monat fuer Sie ausgewaehlt
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => {
                      generateBestsellerSet();
                      setSelectedVariants([...bestsellerVariants]);
                    }}
                    title="Neue Auswahl generieren"
                    data-testid="button-refresh-bestseller"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSetType(null)}
                    data-testid="button-back-to-selection"
                  >
                    Zurück
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Enthaltene Proben</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bestsellerVariants.map(variantId => {
                    const variant = getVariantById(variantId);
                    if (!variant) return null;
                    return (
                      <div key={variantId} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        {variant.productImage && (
                          <img 
                            src={variant.productImage} 
                            alt={variant.name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{variant.name}</p>
                          <p className="text-xs text-muted-foreground">5ml Probe</p>
                        </div>
                        <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      </div>
                    );
                  })}
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <div className="w-full flex justify-between font-semibold text-lg">
                    <span>Gesamt</span>
                    <span>{SAMPLE_SET_PRICE.toFixed(2)}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    data-testid="button-add-bestseller-to-cart"
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
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Individuelles Probenset</h2>
                    <p className="text-muted-foreground">
                      Wählen Sie 5 Proben ({selectedVariants.length}/5 ausgewählt)
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedSetType(null)}
                    data-testid="button-back-to-selection"
                  >
                    Zurück
                  </Button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sampleVariants.map(variant => {
                    const isSelected = selectedVariants.includes(variant.id);
                    return (
                      <Card 
                        key={variant.id}
                        className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : 'hover-elevate'}`}
                        onClick={() => toggleVariant(variant.id)}
                        data-testid={`card-sample-${variant.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {variant.productImage && (
                              <img 
                                src={variant.productImage} 
                                alt={variant.name}
                                className="w-full h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">{variant.name}</p>
                                <p className="text-xs text-muted-foreground">5ml Probe</p>
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

                {sampleVariants.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    Keine Proben verfuegbar. Bitte versuchen Sie es spaeter erneut.
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
                      <p className="text-muted-foreground text-sm">Noch keine Proben ausgewaehlt</p>
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

                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-semibold">
                        <span>Gesamt</span>
                        <span>{SAMPLE_SET_PRICE.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={handleAddToCart}
                      disabled={selectedVariants.length !== 5 || isAdding}
                      data-testid="button-add-individual-to-cart"
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
