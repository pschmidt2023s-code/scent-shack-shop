
import { useState } from 'react';
import { PerfumeCard } from './PerfumeCard';
import { perfumes } from '@/data/perfumes';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function PerfumeGrid() {
  const [sortBy, setSortBy] = useState<string>('name');

  const prestigeCollection = perfumes.find(p => p.category === '50ML Bottles');
  const probenCollection = perfumes.find(p => p.category === 'Proben');

  const sortVariants = (variants: any[]) => {
    return [...variants].sort((a, b) => {
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
  };

  return (
    <>
      {/* Prestige Collection Section */}
      <section id="parfums" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-black">ALDENAIR Prestige Edition</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Exklusive 50ml Parfüm-Flakons der Premium-Kollektion - Luxuriöse Düfte für besondere Momente
            </p>
          </div>

          <div className="flex justify-end mb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {prestigeCollection && sortVariants(prestigeCollection.variants).map((variant) => (
              <PerfumeCard 
                key={variant.id} 
                perfume={{
                  ...prestigeCollection,
                  variants: [variant]
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Proben Collection Section */}
      <section id="proben" className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-luxury-black">ALDENAIR Proben Kollektion</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Entdecke alle Düfte in praktischen 5ml Proben - Perfekt zum Testen vor dem Kauf der Vollgröße
            </p>
          </div>

          <div className="flex justify-end mb-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {probenCollection && sortVariants(probenCollection.variants).map((variant) => (
              <PerfumeCard 
                key={variant.id} 
                perfume={{
                  ...probenCollection,
                  variants: [variant]
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
