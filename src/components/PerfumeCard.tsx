
import { Star, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Perfume } from '@/types/perfume';
import { usePerfumeRatings } from '@/hooks/usePerfumeRatings';
import { useNavigate } from 'react-router-dom';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const navigate = useNavigate();
  const { getRatingForPerfume } = usePerfumeRatings([perfume.id]);

  const handleViewProduct = () => {
    navigate(`/product/${perfume.id}`);
  };

  const perfumeRating = getRatingForPerfume(perfume.id);
  const averageRating = perfumeRating.averageRating || 0;
  const totalReviews = perfumeRating.totalReviews || 0;
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
    <Card 
      className="group hover:shadow-glow hover-lift transition-all duration-700 cursor-pointer overflow-hidden bg-gradient-to-br from-white via-white to-gray-50/30 border-0 shadow-lg animate-scale-in hover:scale-[1.03] hover:-rotate-1 hover:z-10 relative backdrop-blur-sm h-full flex flex-col" 
      onClick={handleViewProduct}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        e.currentTarget.style.setProperty('--magnetic-x', `${x * 0.1}px`);
        e.currentTarget.style.setProperty('--magnetic-y', `${y * 0.1}px`);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.setProperty('--magnetic-x', '0px');
        e.currentTarget.style.setProperty('--magnetic-y', '0px');
      }}
    >
      <div className="relative overflow-hidden rounded-t-lg flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/10 via-transparent to-luxury-gold/5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-700" />
        
        <div className="h-64 w-full bg-gray-100 flex items-center justify-center">
          <img
            src={perfume.image}
            alt={`${perfume.name} - ${perfume.brand} ${perfume.category} ${perfume.size} Parfüm`}
            className="max-h-full max-w-full object-contain group-hover:scale-115 transition-all duration-1000 group-hover:brightness-110 group-hover:saturate-110"
            loading="lazy"
            decoding="async"
            width="306"
            height="256"
          />
        </div>
        
        {/* Quick Actions */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 flex flex-col gap-2 z-20">
          <Button
            size="icon"
            variant="luxury"
            onClick={(e) => {
              e.stopPropagation();
            }}
            className="shadow-xl hover:shadow-glow bg-white/30 backdrop-blur-md hover:bg-white/40 transition-all duration-300 hover:scale-110 hover:rotate-12 border border-white/20"
          >
            <Eye className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
          </Button>
        </div>

        {/* Variant Count Badge */}
        <div className="absolute top-4 left-4 z-20 transform opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-2 group-hover:translate-x-0">
          <Badge variant="secondary" className="bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold text-luxury-black backdrop-blur-sm hover-glow shadow-lg animate-glow-pulse border border-luxury-gold/20">
            {perfume.variants.length} Varianten
          </Badge>
        </div>
      </div>

      <CardContent className="p-6 relative backdrop-blur-sm flex-1 flex flex-col">
        <div className="space-y-4 flex-1 flex flex-col">
          <p className="text-sm text-luxury-gold font-semibold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            {perfume.brand}
          </p>
          <h3 className="font-bold text-xl group-hover:text-luxury-gold transition-all duration-500 leading-tight transform group-hover:translate-x-2 group-hover:scale-105 flex-shrink-0">
            {perfume.name}
          </h3>
          
          <div className="transform transition-all duration-500 group-hover:scale-110 group-hover:translate-x-1 flex-shrink-0">
            {totalReviews > 0 ? renderStars(averageRating) : (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-muted-foreground group-hover:text-luxury-gold/70 transition-colors duration-300">Noch keine Bewertungen</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground font-medium group-hover:text-luxury-gold/60 transition-all duration-300 transform group-hover:translate-x-1 flex-shrink-0">
            {perfume.category} • {perfume.size}
          </p>
          
          <div className="flex-1 flex flex-col justify-end">
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-luxury-gold/20 transition-all duration-500 mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-foreground group-hover:text-luxury-gold transition-all duration-500 transform group-hover:scale-110 group-hover:translate-x-2">
                  {priceRange.min === priceRange.max 
                    ? `€${priceRange.min.toFixed(2)}`
                    : `€${priceRange.min.toFixed(2)} - €${priceRange.max.toFixed(2)}`
                  }
                </span>
              </div>
              
              <Badge variant="outline" className="text-xs border-luxury-gold/30 text-luxury-gray group-hover:border-luxury-gold group-hover:text-luxury-gold group-hover:bg-luxury-gold/10 transition-all duration-300 transform group-hover:scale-105">
                {perfume.size}
              </Badge>
            </div>

            <div className="flex gap-2 transform transition-all duration-500 group-hover:translate-y-1">
              <Button 
                className="flex-1 bg-gradient-primary hover:shadow-glow transition-all duration-500 hover:scale-105 font-semibold relative overflow-hidden group/btn"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold/20 via-luxury-gold-light/20 to-luxury-gold/20 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                <ShoppingBag className="w-4 h-4 mr-2 transition-transform duration-300 group-hover/btn:scale-110 group-hover/btn:rotate-12 relative z-10" />
                <span className="relative z-10 transition-transform duration-300 group-hover/btn:scale-105">
                  Varianten ansehen
                </span>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
