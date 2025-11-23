
import { useState, useEffect, memo } from 'react';
import { PerfumeCard } from './PerfumeCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          brand,
          category,
          size,
          image,
          product_variants(
            id,
            variant_number,
            name,
            description,
            price,
            original_price,
            in_stock,
            preorder,
            release_date,
            rating,
            review_count
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading products:', error);
        return;
      }

      if (products) {
        // Transform database products to Perfume format
        // Filter out Testerkits and Sparkits
        const transformedPerfumes: Perfume[] = products
          .filter((p: any) => {
            // Exclude Testerkits and Sparkits (5x Proben)
            const isTestkit = p.category === 'Testerkits';
            const isSparkit = p.name.toLowerCase().includes('sparkit') || 
                            p.name.toLowerCase().includes('proben');
            return p.product_variants && p.product_variants.length > 0 && !isTestkit && !isSparkit;
          })
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            category: p.category,
            size: p.size,
            image: p.image || '/placeholder.svg',
            variants: p.product_variants.map((v: any) => ({
              id: v.id,
              number: v.variant_number,
              name: v.name,
              description: v.description,
              price: v.price,
              originalPrice: v.original_price,
              inStock: v.in_stock,
              preorder: v.preorder,
              releaseDate: v.release_date,
              rating: v.rating,
              reviewCount: v.review_count,
            })),
          }));

        setPerfumes(transformedPerfumes);
        
        // Extract unique categories
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
    <section className="py-16 glass rounded-3xl mx-4 my-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-luxury-gold/20 via-luxury-gold to-luxury-gold/20 bg-[length:400%_100%] bg-clip-text text-transparent animate-shimmer">
            ALDENAIR Kollektionen
          </h2>
          <p className="text-xl glass-text-dark opacity-80 max-w-2xl mx-auto leading-relaxed">
            Entdecke unsere exklusiven Duft-Kollektionen - Wähle deine Favoriten
          </p>
        </div>

        {/* Sort Options */}
        <div className="flex justify-end mb-8">
          <div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 transition-all duration-300 hover:scale-105 hover:shadow-glow">
                <SelectValue placeholder="Sortieren nach" />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-md bg-background/80">
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Preis: Niedrig bis Hoch</SelectItem>
                <SelectItem value="price-high">Preis: Hoch bis Niedrig</SelectItem>
                <SelectItem value="rating">Bewertung</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedPerfumes.map((perfume) => (
                <div 
                  key={perfume.id} 
                  className="group"
                >
                  <PerfumeCard 
                    perfume={perfume} 
                  />
                </div>
              ))}
            </div>

            {sortedPerfumes.length === 0 && !loading && (
              <div className="text-center py-12 animate-fade-in-up">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground animate-float" />
                <p className="text-xl text-muted-foreground">
                  Keine Parfüms in dieser Kategorie gefunden.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
});
