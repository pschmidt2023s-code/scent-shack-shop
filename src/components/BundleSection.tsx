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
}

const bundles: BundleOption[] = [
  {
    id: '5-proben',
    title: 'Sparkit - 5x Proben',
    description: 'Stelle dir dein persönliches Testerset zusammen',
    items: '5x 5ml Proben deiner Wahl',
    price: 29.95,
    originalPrice: 34.75,
    discount: 14,
    image: '/lovable-uploads/dc821e74-0a27-4a45-a347-45a4ae0d55ef.png',
    link: '/bundle-konfigurator?type=5-proben',
  },
  {
    id: '3-flakons',
    title: 'Sparkit - 3x 50ml Flakons',
    description: 'Perfekt zum Kennenlernen verschiedener Düfte',
    items: '3x 50ml Flakons deiner Wahl',
    price: 129.99,
    originalPrice: 149.97,
    discount: 13,
    image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png',
    link: '/bundle-konfigurator?type=3-flakons',
  },
  {
    id: '5-flakons',
    title: 'Sparkit - 5x 50ml Flakons',
    description: 'Unser beliebtestes Bundle mit maximaler Ersparnis',
    items: '5x 50ml Flakons deiner Wahl',
    price: 199.99,
    originalPrice: 249.95,
    discount: 20,
    image: '/lovable-uploads/4d4b973a-754d-424c-86af-d0eeaee701b2.png',
    link: '/bundle-konfigurator?type=5-flakons',
  },
];

export function BundleSection() {
  return (
    <section className="py-16 glass rounded-3xl mx-4 my-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-luxury-gold animate-pulse" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-luxury-gold/20 via-luxury-gold to-luxury-gold/20 bg-[length:400%_100%] bg-clip-text text-transparent animate-shimmer">
              Sparkits - Spare beim Bundle-Kauf
            </h2>
          </div>
          <p className="text-xl glass-text-dark opacity-80 max-w-2xl mx-auto leading-relaxed">
            Stelle dir dein persönliches Bundle zusammen und spare dabei! Wähle deine Lieblingsdüfte aus unserem kompletten Sortiment.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bundles.map((bundle, index) => (
            <Card
              key={bundle.id}
              className="relative overflow-hidden hover:shadow-glow transition-all duration-300 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Sparkle Effect */}
              <div className="absolute top-4 right-4 z-10">
                <Sparkles className="w-6 h-6 text-luxury-gold animate-pulse" />
              </div>

              {/* Discount Badge */}
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-green-500 hover:bg-green-600 text-white font-bold">
                  -{bundle.discount}% SPAREN
                </Badge>
              </div>

              {/* Image */}
              <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-muted to-muted/50">
                <img
                  src={bundle.image}
                  alt={bundle.title}
                  className="w-full h-full object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-2">
                  <Package className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{bundle.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{bundle.description}</p>
                    <p className="text-sm font-medium text-primary">{bundle.items}</p>
                  </div>
                </div>

                {/* Pricing */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground line-through text-sm">
                      €{bundle.originalPrice.toFixed(2)}
                    </span>
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Spare €{(bundle.originalPrice - bundle.price).toFixed(2)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bundle-Preis:</span>
                    <span className="text-3xl font-bold text-primary">€{bundle.price.toFixed(2)}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link to={bundle.link}>
                  <Button className="w-full gap-2 group" size="lg">
                    <span>Jetzt zusammenstellen</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 text-center glass-light rounded-2xl p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Package className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">So funktioniert's</h3>
          </div>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Wähle dein Bundle, stelle deine Lieblingsdüfte zusammen und spare automatisch! 
            Perfekt, um verschiedene Düfte zu testen oder deine Sammlung zu erweitern. 
            Alle Produkte aus unserem Sortiment sind verfügbar.
          </p>
        </div>
      </div>
    </section>
  );
}
