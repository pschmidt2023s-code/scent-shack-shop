import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';
import { perfumes } from '@/data/perfumes';

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

  useEffect(() => {
    const timer = setTimeout(() => {
      generateRecommendations();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentProductId]);

  const generateRecommendations = () => {
    setLoading(true);
    
    const allVariants: RecommendedProduct[] = [];
    
    for (const perfume of perfumes) {
      for (const variant of perfume.variants) {
        if (variant.id !== currentProductId) {
          allVariants.push({
            id: variant.id,
            name: variant.name,
            brand: perfume.brand,
            image: perfume.image,
            price: variant.price,
            reason: getRecommendationReason(perfume.category),
          });
        }
      }
    }

    const shuffled = allVariants.sort(() => Math.random() - 0.5);
    setRecommendations(shuffled.slice(0, limit));
    setLoading(false);
  };

  const getRecommendationReason = (category: string): string => {
    const reasons = [
      'Beliebt bei anderen Kunden',
      'Passend zu Ihrem Stil',
      'Bestseller dieser Saison',
      'Exklusive Auswahl',
      'Kunden kauften auch',
    ];
    return reasons[Math.floor(Math.random() * reasons.length)];
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Empfehlungen</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Das koennte Ihnen auch gefallen</h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`}>
            <Card className="p-3 hover-elevate transition-all cursor-pointer h-full">
              <div className="relative aspect-square mb-3 overflow-hidden rounded-md">
                <OptimizedImage
                  src={product.image}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">{product.brand}</p>
                <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
                <p className="text-sm font-semibold text-primary">{product.price.toFixed(2)} EUR</p>
                
                <Badge variant="secondary" className="text-xs">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {product.reason}
                </Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
