import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PerfumeCard } from '@/components/PerfumeCard';
import { perfumes } from '@/data/perfumes';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Products() {
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Header */}
        <section className="bg-gradient-primary text-primary-foreground py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <Link to="/">
                  <Button variant="outline" size="sm" className="mr-4 bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                </Link>
              </div>
              
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-4">ALDENAIR Parfüm-Kollektion</h1>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                  Entdecke unsere komplette Parfüm-Kollektion - Von luxuriösen 50ml Flakons bis zu praktischen 5ml Proben
                </p>
              </div>
            </div>
          </div>
        </section>

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
      </main>

      <Footer />
    </div>
  );
}