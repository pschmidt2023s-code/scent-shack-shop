import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Sparkles, ArrowRight } from 'lucide-react';

interface BundleOption {
  id: string;
  title: string;
  description: string;
  items: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  link: string;
  quantity_required: number;
}

const DEFAULT_BUNDLES: BundleOption[] = [
  {
    id: '5-proben',
    title: 'Probenset - 5x 5ml',
    description: 'Stelle dir dein persönliches Testerset zusammen',
    items: '5x 5ml Proben deiner Wahl',
    price: 29.95,
    originalPrice: 34.75,
    discount: 14,
    image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
    link: '/probensets',
    quantity_required: 5
  },
  {
    id: '3-flakons',
    title: 'Sparset - 3x 50ml Flakons',
    description: 'Perfekt zum Kennenlernen verschiedener Düfte',
    items: '3x 50ml Flakons deiner Wahl',
    price: 129.99,
    originalPrice: 149.97,
    discount: 13,
    image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png',
    link: '/sparsets',
    quantity_required: 3
  },
  {
    id: '5-flakons',
    title: 'Sparset - 5x 50ml Flakons',
    description: 'Maximale Auswahl für echte Duft-Liebhaber',
    items: '5x 50ml Flakons deiner Wahl',
    price: 199.99,
    originalPrice: 249.95,
    discount: 20,
    image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png',
    link: '/sparsets',
    quantity_required: 5
  }
];

export function BundleSection() {
  const [bundles] = useState<BundleOption[]>(DEFAULT_BUNDLES);

  if (bundles.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Package className="w-6 h-6 text-primary" />
            <Badge variant="secondary" className="text-sm">
              Spare bis zu 20%
            </Badge>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Bundle Angebote
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Kombiniere deine Lieblingsdüfte und spare dabei - stelle dir dein persönliches Set zusammen
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bundles.map((bundle, index) => (
            <Card 
              key={bundle.id} 
              className="relative overflow-hidden hover-elevate transition-all duration-300 group"
            >
              {bundle.discount >= 15 && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Bestseller
                  </Badge>
                </div>
              )}
              
              <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                <img
                  src={bundle.image}
                  alt={bundle.title}
                  className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="destructive" className="text-sm font-bold">
                    -{bundle.discount}%
                  </Badge>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{bundle.title}</h3>
                <p className="text-muted-foreground text-sm mb-3">{bundle.description}</p>
                <p className="text-sm text-muted-foreground mb-4">{bundle.items}</p>

                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-2xl font-bold text-primary">
                    {bundle.price.toFixed(2)} EUR
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {bundle.originalPrice.toFixed(2)} EUR
                  </span>
                </div>

                <Link to={bundle.link}>
                  <Button className="w-full group" data-testid={`button-bundle-${bundle.id}`}>
                    Bundle zusammenstellen
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
