
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Perfume } from '@/types/perfume';
import { useNavigate } from 'react-router-dom';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const navigate = useNavigate();

  const handleViewProduct = () => {
    navigate(`/product/${perfume.id}`);
  };

  const averageRating = perfume.variants.reduce((sum, variant) => sum + (variant.rating || 0), 0) / perfume.variants.length;
  const totalReviews = perfume.variants.reduce((sum, variant) => sum + (variant.reviewCount || 0), 0);
  const priceRange = {
    min: Math.min(...perfume.variants.map(v => v.price)),
    max: Math.max(...perfume.variants.map(v => v.price))
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) 
                ? 'fill-luxury-gold text-luxury-gold' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          ({totalReviews})
        </span>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-luxury transition-all duration-300 cursor-pointer">
      <div className="relative overflow-hidden" onClick={handleViewProduct}>
        <img
          src={perfume.image}
          alt={`${perfume.name} - ${perfume.brand} ${perfume.category} ${perfume.size} Parfüm`}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          decoding="async"
          width="306"
          height="256"
        />
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-2">
          <Button
            size="icon"
            variant="luxury"
            onClick={(e) => {
              e.stopPropagation();
              handleViewProduct();
            }}
            className="shadow-lg"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        {/* Variant Count Badge */}
        <div className="absolute top-4 left-4">
          <Badge variant="secondary" className="bg-luxury-gold text-luxury-black">
            {perfume.variants.length} Varianten
          </Badge>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-luxury-gold font-medium">{perfume.brand}</p>
          <h3 className="font-semibold text-lg group-hover:text-luxury-gold transition-colors">
            {perfume.name}
          </h3>
          
          {renderStars(averageRating)}
          
          <p className="text-sm text-muted-foreground">
            {perfume.category} • {perfume.size}
          </p>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground">
                {priceRange.min === priceRange.max 
                  ? `€${priceRange.min.toFixed(2)}`
                  : `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`
                }
              </span>
            </div>
            
            <Badge variant="outline" className="text-xs">
              {perfume.size}
            </Badge>
          </div>

          <div className="flex gap-2 mt-4">
            <Button 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                handleViewProduct();
              }}
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Varianten ansehen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
