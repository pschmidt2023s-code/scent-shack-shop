import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PerfumeCard } from '@/components/PerfumeCard';
import { perfumes } from '@/data/perfumes';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');

  console.log('Products page - Category filter:', categoryFilter);

  // Get the specific collection based on URL parameter
  let selectedCollection = null;
  let pageTitle = 'ALDENAIR Parfüm-Kollektion';
  let pageDescription = 'Entdecke unsere komplette Parfüm-Kollektion';

  if (categoryFilter === '50ML Bottles') {
    selectedCollection = perfumes.find(p => p.category === '50ML Bottles');
    pageTitle = 'ALDENAIR Prestige Edition';
    pageDescription = 'Exklusive 50ml Parfüm-Flakons der Premium-Kollektion';
  } else if (categoryFilter === 'Proben') {
    selectedCollection = perfumes.find(p => p.category === 'Proben');
    pageTitle = 'ALDENAIR Proben Kollektion';
    pageDescription = 'Entdecke alle Düfte in praktischen 5ml Proben';
  } else {
    // Show all collections if no filter
    selectedCollection = null;
  }

  console.log('Selected collection:', selectedCollection);

  return (
    <div className="min-h-screen glass">
      <Navigation />
      
      <main>
        {/* Header */}
        <section className="bg-gradient-primary text-primary-foreground py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <Breadcrumb 
                  items={[
                    { label: 'Parfüms', isActive: true }
                  ]} 
                  className="text-primary-foreground/80"
                />
              </div>
              
              <div className="animate-slide-up">
                <h1 className="text-5xl md:text-6xl font-bold mb-4">
                  {pageTitle}
                </h1>
                <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                  {pageDescription}
                </p>
                
                {selectedCollection && (
                  <p className="text-lg text-primary-foreground/90">
                    {selectedCollection.variants.length} Produkte verfügbar
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Products Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Single Collection Display */}
            {selectedCollection && (
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {selectedCollection.variants.map((variant, index) => (
                    <div key={variant.id} className="hover:scale-105 transition-transform duration-300">
                      <PerfumeCard 
                        perfume={{
                          ...selectedCollection,
                          variants: [variant]
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Collections Display (fallback) */}
            {!selectedCollection && (
              <div className="max-w-7xl mx-auto space-y-16">
                {/* Prestige Collection */}
                {perfumes.find(p => p.category === '50ML Bottles') && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-4">
                        ALDENAIR Prestige Edition
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Exklusive 50ml Parfüm-Flakons der Premium-Kollektion
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                      {perfumes.find(p => p.category === '50ML Bottles')?.variants.slice(0, 8).map((variant, index) => (
                        <div key={variant.id} className="hover:scale-105 transition-transform duration-300">
                          <PerfumeCard 
                            perfume={{
                              ...perfumes.find(p => p.category === '50ML Bottles')!,
                              variants: [variant]
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proben Collection */}
                {perfumes.find(p => p.category === 'Proben') && (
                  <div>
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold mb-4">
                        ALDENAIR Proben Kollektion
                      </h2>
                      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Entdecke alle Düfte in praktischen 5ml Proben
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {perfumes.find(p => p.category === 'Proben')?.variants.slice(0, 8).map((variant, index) => (
                        <div key={variant.id} className="hover:scale-105 transition-transform duration-300">
                          <PerfumeCard 
                            perfume={{
                              ...perfumes.find(p => p.category === 'Proben')!,
                              variants: [variant]
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}