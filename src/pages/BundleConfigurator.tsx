import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ShoppingCart, Package, Sparkles, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import type { Perfume, PerfumeVariant } from '@/types/perfume';

type BundleType = '5-proben' | '3-flakons' | '5-flakons';

interface BundleConfig {
  type: BundleType;
  title: string;
  description: string;
  maxSelection: number;
  price: number;
  originalPrice: number;
  discount: number;
  category: string;
}

const bundleConfigs: Record<BundleType, BundleConfig> = {
  '5-proben': {
    type: '5-proben',
    title: 'Sparkit - 5x Proben',
    description: 'Wähle 5 beliebige 5ml Proben aus unserem Sortiment',
    maxSelection: 5,
    price: 29.95,
    originalPrice: 34.75,
    discount: 14,
    category: 'Testerkits',
  },
  '3-flakons': {
    type: '3-flakons',
    title: 'Sparkit - 3x 50ml Flakons',
    description: 'Wähle 3 beliebige 50ml Flakons aus unserem Sortiment',
    maxSelection: 3,
    price: 129.99,
    originalPrice: 149.97,
    discount: 13,
    category: '50ML Bottles',
  },
  '5-flakons': {
    type: '5-flakons',
    title: 'Sparkit - 5x 50ml Flakons',
    description: 'Wähle 5 beliebige 50ml Flakons aus unserem Sortiment',
    maxSelection: 5,
    price: 199.99,
    originalPrice: 249.95,
    discount: 20,
    category: '50ML Bottles',
  },
};

export default function BundleConfigurator() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const bundleType = (searchParams.get('type') as BundleType) || '5-proben';
  const config = bundleConfigs[bundleType];
  
  const [products, setProducts] = useState<Perfume[]>([]);
  const [selectedVariants, setSelectedVariants] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [config.category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products?category=${encodeURIComponent(config.category)}`);
      if (!response.ok) {
        console.error('Error loading bundles:', response.statusText);
        return;
      }
      
      const data = await response.json();

      if (data && Array.isArray(data)) {
        const uniqueVariantsMap = new Map<string, any>();
        
        data.forEach((p: any) => {
          if (p.variants && p.variants.length > 0) {
            p.variants.forEach((v: any) => {
              if (!uniqueVariantsMap.has(v.variantNumber)) {
                uniqueVariantsMap.set(v.variantNumber, {
                  productData: p,
                  variantData: v
                });
              }
            });
          }
        });

        const transformedPerfumes: Perfume[] = Array.from(uniqueVariantsMap.values()).map((entry) => {
          const p = entry.productData;
          const v = entry.variantData;
          
          return {
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            size: p.size,
            image: p.image || '/placeholder.svg',
            variants: [{
              id: v.id,
              number: v.variantNumber,
              name: v.name,
              description: v.description,
              price: v.price,
              inStock: v.inStock,
            }]
          };
        });

        setProducts(transformedPerfumes);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: 'Fehler',
        description: 'Produkte konnten nicht geladen werden.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVariant = (variantId: string) => {
    const newSelected = new Set(selectedVariants);
    
    if (newSelected.has(variantId)) {
      newSelected.delete(variantId);
    } else {
      if (newSelected.size >= config.maxSelection) {
        toast({
          title: 'Maximale Auswahl erreicht',
          description: `Du kannst maximal ${config.maxSelection} Produkte auswählen.`,
        });
        return;
      }
      newSelected.add(variantId);
    }
    
    setSelectedVariants(newSelected);
  };

  const handleAddToCart = () => {
    if (selectedVariants.size !== config.maxSelection) {
      toast({
        title: 'Unvollständige Auswahl',
        description: `Bitte wähle genau ${config.maxSelection} Produkte aus.`,
        variant: 'destructive',
      });
      return;
    }

    // Add each selected variant to cart
    products.forEach((perfume) => {
      perfume.variants.forEach((variant) => {
        if (selectedVariants.has(variant.id)) {
          addToCart(perfume, variant);
        }
      });
    });

    toast({
      title: 'Bundle hinzugefügt',
      description: `Dein ${config.title} wurde zum Warenkorb hinzugefügt!`,
    });

    navigate('/checkout');
  };

  const selectedCount = selectedVariants.size;
  const isComplete = selectedCount === config.maxSelection;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-luxury-gold animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-luxury-gold/20 via-luxury-gold to-luxury-gold/20 bg-clip-text text-transparent">
              {config.title}
            </h1>
          </div>
          <p className="text-xl text-muted-foreground mb-4">{config.description}</p>
          <Badge variant="secondary" className="bg-green-100 text-green-700 text-lg px-4 py-2">
            Spare {config.discount}% • €{(config.originalPrice - config.price).toFixed(2)} Rabatt
          </Badge>
        </div>

        {/* Selection Progress */}
        <Card className="p-6 mb-8 sticky top-20 z-10 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              <span className="font-semibold">
                Deine Auswahl: {selectedCount} / {config.maxSelection}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground line-through">€{config.originalPrice.toFixed(2)}</p>
              <p className="text-2xl font-bold text-primary">€{config.price.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(selectedCount / config.maxSelection) * 100}%` }}
            />
          </div>
          
          <Button
            onClick={handleAddToCart}
            disabled={!isComplete}
            className="w-full gap-2"
            size="lg"
          >
            {isComplete ? (
              <>
                <Check className="w-5 h-5" />
                Bundle in den Warenkorb
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                Noch {config.maxSelection - selectedCount} auswählen
              </>
            )}
          </Button>
        </Card>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((perfume) =>
              perfume.variants.map((variant) => {
                const isSelected = selectedVariants.has(variant.id);
                const canSelect = selectedCount < config.maxSelection || isSelected;
                
                return (
                  <Card
                    key={variant.id}
                    className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-lg ${
                      isSelected ? 'ring-2 ring-primary shadow-glow' : ''
                    } ${!canSelect ? 'opacity-50' : ''}`}
                    onClick={() => canSelect && toggleVariant(variant.id)}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-2">
                        <Check className="w-5 h-5" />
                      </div>
                    )}
                    
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={perfume.image}
                        alt={variant.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-1">{variant.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{variant.number}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {variant.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">€{variant.price.toFixed(2)}</span>
                        <Checkbox
                          checked={isSelected}
                          disabled={!canSelect}
                          onCheckedChange={() => canSelect && toggleVariant(variant.id)}
                          className="pointer-events-none"
                        />
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-float" />
            <p className="text-xl text-muted-foreground">
              Keine Produkte in dieser Kategorie gefunden.
            </p>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
