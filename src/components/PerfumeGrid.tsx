
import { useState } from 'react';
import { PerfumeCard } from './PerfumeCard';
import { allPerfumes } from '@/data/perfumes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PerfumeGrid() {
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  const categories = ['all', 'Unisex', 'Proben'];

  const filteredPerfumes = allPerfumes.filter(perfume => 
    filter === 'all' || perfume.category === filter
  );

  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">ALDENAIR Parfüm-Kollektion</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Entdecke exquisite Düfte der Marke ALDENAIR - Prestige Flakon für jeden Geschmack
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-between items-center">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={filter === category ? "default" : "outline"}
                onClick={() => setFilter(category)}
                className="capitalize"
              >
                {category === 'all' ? 'Alle' : category}
              </Button>
            ))}
          </div>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sortieren nach" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="price-low">Preis: Niedrig bis Hoch</SelectItem>
              <SelectItem value="price-high">Preis: Hoch bis Niedrig</SelectItem>
              <SelectItem value="rating">Bewertung</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedPerfumes.map((perfume) => (
            <PerfumeCard 
              key={perfume.id} 
              perfume={perfume}
            />
          ))}
        </div>

        {sortedPerfumes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Keine Parfüms in dieser Kategorie gefunden.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
