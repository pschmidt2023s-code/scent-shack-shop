import { useState, useEffect, memo } from 'react';
import { VariantCard } from './VariantCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, SlidersHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface FlatVariant {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

export const PerfumeGrid = memo(function PerfumeGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [variants, setVariants] = useState<FlatVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>(['all']);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        console.error('Error loading products:', response.statusText);
        return;
      }

      const products = await response.json();

      if (products && Array.isArray(products)) {
        const flatVariants: FlatVariant[] = [];
        
        products.forEach((p: any) => {
          const isTestkit = p.category === 'Testerkits';
          const isAutoParfum = p.category === 'Auto Perfumes';
          const isSparkit = p.name?.toLowerCase().includes('sparkit') || 
                          p.name?.toLowerCase().includes('proben') ||
                          p.name?.toLowerCase().includes('probe');
          
          if (p.variants && p.variants.length > 0 && !isTestkit && !isSparkit && !isAutoParfum) {
            p.variants.forEach((v: any) => {
              flatVariants.push({
                productId: p.id,
                variantId: v.id,
                productName: p.name,
                variantName: v.name,
                category: p.category,
                price: parseFloat(v.price) || 0,
                originalPrice: parseFloat(v.originalPrice) || undefined,
                image: v.image || p.image || '/placeholder.svg',
                rating: v.rating ?? 4.5,
                reviewCount: v.reviewCount ?? 0,
                inStock: v.inStock ?? true,
              });
            });
          }
        });

        setVariants(flatVariants);
        
        const uniqueCategories = ['all', ...Array.from(new Set(flatVariants.map(v => v.category)))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredVariants = variants.filter(v => 
    filter === 'all' || v.category === filter
  );

  const sortedVariants = [...filteredVariants].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default:
        return a.variantName.localeCompare(b.variantName);
    }
  });

  const displayVariants = sortedVariants.slice(0, 8);

  return (
    <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 p-4 bg-muted/50 rounded-xl">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filter === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(cat)}
                data-testid={`filter-${cat}`}
              >
                {cat === 'all' ? 'Alle Düfte' : cat}
              </Button>
            ))}
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-background" data-testid="select-sort">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sortieren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name A-Z</SelectItem>
              <SelectItem value="price-low">Preis: Niedrig - Hoch</SelectItem>
              <SelectItem value="price-high">Preis: Hoch - Niedrig</SelectItem>
              <SelectItem value="rating">Beste Bewertung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : displayVariants.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {displayVariants.map((variant, index) => (
              <div key={`${variant.productId}-${variant.variantId}`} className="stagger-item">
                <VariantCard variant={variant} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/30 rounded-2xl">
            <Package className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Keine Produkte gefunden</h3>
            <p className="text-muted-foreground mb-6">
              Versuche einen anderen Filter oder schaue spater nochmal vorbei.
            </p>
            <Button onClick={() => setFilter('all')}>
              Alle Produkte anzeigen
            </Button>
          </div>
        )}
    </div>
  );
});
