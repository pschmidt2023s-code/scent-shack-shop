import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { SortAsc } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PerfumeCard } from '@/components/PerfumeCard';
import { perfumes } from '@/data/perfumes';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Products() {
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const prestigeCollection = perfumes.find(p => p.category === '50ML Bottles');
  const probenCollection = perfumes.find(p => p.category === 'Proben');

  // Filter variants based on search query
  const filterVariants = (variants: any[]) => {
    if (!searchQuery) return variants;
    
    return variants.filter(variant =>
      variant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      variant.number.includes(searchQuery)
    );
  };

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

  const handleSearch = (value: string) => {
    setIsLoading(true);
    setSearchQuery(value);
    // Simulate search delay for better UX
    setTimeout(() => setIsLoading(false), 300);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsLoading(false);
  };

  const filteredPrestige = filterVariants(prestigeCollection?.variants || []);
  const filteredProben = filterVariants(probenCollection?.variants || []);
  const hasResults = filteredPrestige.length > 0 || filteredProben.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main>
        {/* Header */}
        <section className="bg-gradient-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <Breadcrumb 
                  items={[
                    { label: 'Parfüms', isActive: true }
                  ]} 
                  className="text-primary-foreground/80"
                />
              </div>
              
              <div className="text-center animate-slide-up">
                <h1 className="text-5xl md:text-6xl font-display font-bold mb-4">
                  ALDENAIR Parfüm-Kollektion
                </h1>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                  Entdecke unsere komplette Parfüm-Kollektion - Von luxuriösen 50ml Flakons bis zu praktischen 5ml Proben
                </p>
                
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
                  <div className="flex-1">
                    <SearchInput
                      placeholder="Parfüm suchen... (Name, Nummer oder Beschreibung)"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      onClear={clearSearch}
                      isLoading={isLoading}
                      className="w-full"
                    />
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-48 bg-white/10 border-white/20 text-primary-foreground">
                      <SortAsc className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Sortieren" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="price-low">Preis: Niedrig bis Hoch</SelectItem>
                      <SelectItem value="price-high">Preis: Hoch bis Niedrig</SelectItem>
                      <SelectItem value="rating">Bewertung</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* No Results */}
        {searchQuery && !hasResults && !isLoading && (
          <section className="py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-md mx-auto animate-fade-in">
                <h3 className="text-2xl font-display font-semibold mb-4">Keine Ergebnisse gefunden</h3>
                <p className="text-muted-foreground mb-6">
                  Für "{searchQuery}" wurden keine Parfüms gefunden.
                </p>
                <Button onClick={clearSearch} variant="outline">
                  Suche zurücksetzen
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {isLoading && (
          <section className="py-16">
            <div className="container mx-auto px-4">
              <ProductGridSkeleton />
            </div>
          </section>
        )}

        {/* Prestige Collection Section */}
        {!isLoading && filteredPrestige.length > 0 && (
          <section id="parfums" className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 animate-slide-up">
                <h2 className="text-4xl font-display font-bold mb-4 text-luxury-black">
                  ALDENAIR Prestige Edition
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Exklusive 50ml Parfüm-Flakons der Premium-Kollektion - Luxuriöse Düfte für besondere Momente
                </p>
                {searchQuery && (
                  <p className="text-sm text-luxury-gold mt-2 font-medium">
                    {filteredPrestige.length} Ergebnis{filteredPrestige.length !== 1 ? 'se' : ''} in der Prestige Edition
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortVariants(filteredPrestige).map((variant, index) => (
                  <div key={variant.id} className="stagger-item hover-lift">
                    <PerfumeCard 
                      perfume={{
                        ...prestigeCollection!,
                        variants: [variant]
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Proben Collection Section */}
        {!isLoading && filteredProben.length > 0 && (
          <section id="proben" className="py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12 animate-slide-up">
                <h2 className="text-4xl font-display font-bold mb-4 text-luxury-black">
                  ALDENAIR Proben Kollektion
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Entdecke alle Düfte in praktischen 5ml Proben - Perfekt zum Testen vor dem Kauf der Vollgröße
                </p>
                {searchQuery && (
                  <p className="text-sm text-luxury-gold mt-2 font-medium">
                    {filteredProben.length} Ergebnis{filteredProben.length !== 1 ? 'se' : ''} in der Proben Kollektion
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortVariants(filteredProben).map((variant, index) => (
                  <div key={variant.id} className="stagger-item hover-lift">
                    <PerfumeCard 
                      perfume={{
                        ...probenCollection!,
                        variants: [variant]
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}