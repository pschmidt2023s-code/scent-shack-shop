
import { useState } from 'react';
import { PerfumeCard } from './PerfumeCard';
import { perfumes } from '@/data/perfumes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePerfumeRatings } from '@/hooks/usePerfumeRatings';
import { Package } from 'lucide-react';

export function PerfumeGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  // Optimized ratings - only fetch once for all perfumes
  const { getRatingForPerfume, loading: ratingsLoading } = usePerfumeRatings(perfumes.map(p => p.id));

  const categories = ['all', '50ML Bottles', 'Proben'];

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
        // Use real ratings from Supabase if available, fallback to static
        const avgRatingA = getRatingForPerfume(a.id).averageRating || a.variants.reduce((sum, v) => sum + (v.rating || 0), 0) / a.variants.length;
        const avgRatingB = getRatingForPerfume(b.id).averageRating || b.variants.reduce((sum, v) => sum + (v.rating || 0), 0) / b.variants.length;
        return avgRatingB - avgRatingA;
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-luxury-gold to-foreground bg-clip-text text-transparent">
            ALDENAIR Parfüm-Kollektion
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Entdecke exquisite Düfte der Marke ALDENAIR - Prestige Flakon für jeden Geschmack
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center opacity-0 animate-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          <div className="flex flex-wrap gap-2">
            {categories.map((category, index) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className="capitalize transition-all duration-300 hover:scale-105 hover:shadow-glow relative overflow-hidden group"
                style={{ 
                  animationDelay: `${0.6 + index * 0.1}s`,
                  animationFillMode: 'forwards'
                }}
              >
                <span className="relative z-10">{category === 'all' ? 'Alle' : category}</span>
                {filter === category && (
                  <div className="absolute inset-0 bg-gradient-primary opacity-20 animate-glow-pulse"></div>
                )}
              </Button>
            ))}
          </div>

          <div className="opacity-0 animate-fade-in" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPerfumes.map((perfume, index) => (
            <div 
              key={perfume.id} 
              className="stagger-item hover:z-20 relative"
            >
              <PerfumeCard perfume={perfume} />
            </div>
          ))}
        </div>

        {sortedPerfumes.length === 0 && (
          <div className="text-center py-12 animate-fade-in">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl text-muted-foreground">
              Keine Parfüms in dieser Kategorie gefunden.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
