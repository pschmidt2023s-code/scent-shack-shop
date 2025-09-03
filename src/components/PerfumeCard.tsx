import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserRole } from '@/hooks/useUserRole';
import { Perfume } from '@/types/perfume';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { discount, roleLabel, loading, isNewsletterSubscriber } = useUserRole();
  // Disable ratings to debug the issue
  // const { getRatingForPerfume } = usePerfumeRatings([perfume.id]);

  const currentVariant = perfume.variants[selectedVariant];
  // Use static ratings for debugging
  const averageRating = currentVariant.rating || 0;
  const totalReviews = currentVariant.reviewCount || 0;
  const isInFavorites = isFavorite(perfume.id, currentVariant.id);

  const originalPrice = currentVariant.price;
  const discountedPrice = originalPrice * (1 - discount / 100);

  const handleAddToCart = () => {
    addToCart(perfume, currentVariant);
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${currentVariant.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleWishlistToggle = async () => {
    await toggleFavorite(perfume.id, currentVariant.id);
  };

  const handleProductClick = () => {
    // Simple tracking without complex operations
    console.log('Product clicked:', perfume.name);
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
                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                loading="lazy"
                decoding="async"
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
                  console.log('Quick view:', currentVariant.name);
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
                <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>

            {/* Stock Badge */}
            <div className="absolute top-2 left-2">
              <Badge variant={currentVariant.preorder ? "default" : "secondary"} className="text-xs">
                {currentVariant.preorder ? "Vorbestellung" : "Auf Lager"}
              </Badge>
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
              <div className="flex flex-col">
                {discount > 0 && !loading ? (
                  <>
                    <span className="text-xl font-bold text-primary">€{discountedPrice.toFixed(2)}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm line-through text-muted-foreground">€{originalPrice.toFixed(2)}</span>
                      <Badge variant="destructive" className="text-xs">-{discount.toFixed(1)}%</Badge>
                    </div>
                  </>
                ) : (
                  <span className="text-xl font-bold">€{originalPrice.toFixed(2)}</span>
                )}
              </div>
              <Badge variant="secondary">{perfume.category}</Badge>
            </div>

            {/* Discount Information */}
            {!loading && discount > 0 && (
              <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-700 dark:text-green-300">
                  🎉 Ihr Rabatt: {discount.toFixed(1)}% ({roleLabel} + Newsletter)
                </p>
              </div>
            )}

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
              {currentVariant.preorder ? "Vorbestellen" : "In den Warenkorb"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}