import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';

interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  reason: string;
}

interface AIRecommendationsProps {
  currentProductId?: string;
  limit?: number;
}

export function AIRecommendations({ currentProductId, limit = 4 }: AIRecommendationsProps) {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiReason, setAiReason] = useState('');

  useEffect(() => {
    // Debounce recommendations to avoid excessive API calls
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 500);

    return () => clearTimeout(timer);
  }, [user, currentProductId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      // Track current product view (only if user is logged in)
      if (user && currentProductId) {
        await supabase.from('product_views').insert({
          user_id: user.id,
          product_id: currentProductId,
          variant_id: currentProductId,
        });
      }

      // Get different products (not just variants of the same product)
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          brand,
          image,
          category,
          product_variants(id, name, price, in_stock, original_price)
        `)
        .neq('id', currentProductId || '')
        .limit(limit);

      if (error) {
        console.error('Error fetching products:', error);
        return;
      }

      if (products && products.length > 0) {
        const mapped: RecommendedProduct[] = products
          .filter((p: any) => p.product_variants && p.product_variants.length > 0)
          .map((p: any) => {
            // Get first available variant or first variant
            const variants = p.product_variants || [];
            const variant = variants.find((v: any) => v.in_stock) || variants[0];
            
            return {
              id: p.id,
              name: p.name,
              brand: p.brand,
              image: p.image || '/placeholder.svg',
              price: variant?.price || 0,
              reason: 'Basierend auf deinem Geschmack',
            };
          });

        setRecommendations(mapped);
        setAiReason('Diese Produkte könnten dir auch gefallen');
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (recommendations.length === 0 && !loading) return null;

  return (
    <section className="py-8 md:py-12 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center glass-card">
            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold glass-text-dark">Persönliche Empfehlungen</h2>
            <p className="text-xs md:text-sm glass-text-dark opacity-80">{aiReason}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {recommendations.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="relative">
                    <OptimizedImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48"
                      width={300}
                      height={300}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary/90 backdrop-blur">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        KI-Tipp
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{product.brand}</p>
                    <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                      {product.reason}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">
                        €{product.price.toFixed(2)}
                      </span>
                      <Button size="sm" variant="outline" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        Ansehen
                      </Button>
                    </div>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
