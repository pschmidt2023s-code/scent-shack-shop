import { useState, useEffect, memo } from 'react';
import { PerfumeCard } from './PerfumeCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, SlidersHorizontal, Sparkles } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Perfume } from '@/types/perfume';

export const PerfumeGrid = memo(function PerfumeGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
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
        const transformedPerfumes: Perfume[] = products
          .filter((p: any) => {
            const isTestkit = p.category === 'Testerkits';
            const isAutoParfum = p.category === 'Auto Perfumes';
            const isSparkit = p.name?.toLowerCase().includes('sparkit') || 
                            p.name?.toLowerCase().includes('proben') ||
                            p.name?.toLowerCase().includes('probe');
            return p.variants && p.variants.length > 0 && !isTestkit && !isSparkit && !isAutoParfum;
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            size: p.size,
            image: p.image || '/placeholder.svg',
            variants: p.variants.map((v: any, index: number) => ({
              id: v.id,
              number: String(index + 1).padStart(3, '0'),
              name: v.name,
              description: v.description,
              price: parseFloat(v.price) || 0,
              originalPrice: parseFloat(v.originalPrice) || parseFloat(v.price) * 1.2 || 0,
              inStock: v.inStock ?? true,
              preorder: v.preorder ?? false,
              releaseDate: v.releaseDate,
              rating: v.rating ?? 4.5,
              reviewCount: v.reviewCount ?? 0,
            })),
          }));

        setPerfumes(transformedPerfumes);
        
        const uniqueCategories = ['all', ...Array.from(new Set(transformedPerfumes.map(p => p.category)))];
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPerfumes = perfumes.filter(perfume => 
    filter === 'all' || perfume.category === filter
  );

  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price));
      case 'price-high':
        return Math.max(...b.variants.map(v => v.price)) - Math.max(...a.variants.map(v => v.price));
      case 'rating':
        const avgRatingA = a.variants.reduce((sum, v) => sum + (v.rating || 0), 0) / a.variants.length;
        const avgRatingB = b.variants.reduce((sum, v) => sum + (v.rating || 0), 0) / b.variants.length;
        return avgRatingB - avgRatingA;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Handverlesene Auswahl
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Unsere Bestseller
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Premium-Düfte inspiriert von weltbekannten Luxusmarken - 
            hochwertige Qualitat zu fairen Preisen
          </p>
        </div>

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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : sortedPerfumes.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {sortedPerfumes.map((perfume) => (
              <PerfumeCard key={perfume.id} perfume={perfume} />
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
    </section>
  );
});
