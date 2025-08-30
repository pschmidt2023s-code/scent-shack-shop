import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { Perfume } from '@/types/perfume';
import { Link } from 'react-router-dom';
import { usePerfumeRatings } from '@/hooks/usePerfumeRatings';
import { toast } from '@/hooks/use-toast';
import { QuickViewModal } from './QuickViewModal';
import { StockStatus } from './StockStatus';
import { addPerfumeToRecentlyViewed } from './RecentlyViewed';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addToCart } = useCart();
  const { getRatingForPerfume } = usePerfumeRatings([perfume.id]);

  const currentVariant = perfume.variants[selectedVariant];
  const rating = getRatingForPerfume(perfume.id);
  const averageRating = rating.averageRating || 0;
  const totalReviews = rating.totalReviews || 0;

  const handleAddToCart = () => {
    addToCart(perfume, currentVariant);
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${currentVariant.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleWishlistToggle = () => {
    setIsWishlisted(!isWishlisted);
    toast({
      title: isWishlisted ? "Von Wunschliste entfernt" : "Zur Wunschliste hinzugefügt",
      description: `${currentVariant.name} wurde ${isWishlisted ? 'entfernt' : 'hinzugefügt'}.`,
    });
  };

  const handleProductClick = () => {
    addPerfumeToRecentlyViewed(perfume);
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <CardContent className="p-0">
          <div className="relative">
            <Link to={`/product/${perfume.id}`} onClick={handleProductClick}>
              <img
                src={perfume.image}
                alt={currentVariant.name}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
            
            {/* Quick View & Wishlist */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  setShowQuickView(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  handleWishlistToggle();
                }}
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Stock Status */}
            <div className="absolute top-2 left-2">
              <StockStatus stock={Math.floor(Math.random() * 20) + 1} />
            </div>
          </div>

          <div className="p-4">
            <Link to={`/product/${perfume.id}`} onClick={handleProductClick}>
              <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                {currentVariant.name}
              </h3>
            </Link>
            
            <p className="text-sm text-muted-foreground mb-2">{currentVariant.number}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(averageRating) 
                      ? 'fill-yellow-400 text-yellow-400' 
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-1">
                ({totalReviews})
              </span>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xl font-bold">€{currentVariant.price.toFixed(2)}</span>
              <Badge variant="secondary">{perfume.category}</Badge>
            </div>

            {/* Variant Selection */}
            {perfume.variants.length > 1 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {perfume.variants.map((variant, index) => (
                    <button
                      key={variant.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedVariant(index);
                      }}
                      className={`px-2 py-1 text-xs border rounded transition-colors ${
                        selectedVariant === index
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-muted-foreground/20 hover:border-primary'
                      }`}
                    >
                      {variant.name.split(' - ')[1] || variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={(e) => {
                e.preventDefault();
                handleAddToCart();
              }}
              className="w-full"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              In den Warenkorb
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <QuickViewModal
        perfume={perfume}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
}