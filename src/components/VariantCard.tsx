import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';
import { OptimizedImage } from './OptimizedImage';

interface VariantData {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface VariantCardProps {
  variant: VariantData;
}

export function VariantCard({ variant }: VariantCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  const isInFavorites = isFavorite(variant.productId, variant.variantId);

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInFavorites) {
      await removeFromFavorites(variant.productId, variant.variantId);
    } else {
      await addToFavorites(variant.productId, variant.variantId);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(
      { 
        id: variant.productId, 
        name: variant.productName, 
        brand: '', 
        category: variant.category, 
        size: '50ml', 
        image: variant.image, 
        variants: [] 
      },
      { 
        id: variant.variantId, 
        number: '', 
        name: variant.variantName, 
        description: '', 
        price: variant.price, 
        originalPrice: variant.originalPrice || variant.price, 
        inStock: variant.inStock ?? true, 
        preorder: false 
      }
    );
  };

  const hasDiscount = variant.originalPrice && variant.originalPrice > variant.price;
  const discountPercent = hasDiscount 
    ? Math.round((1 - variant.price / variant.originalPrice!) * 100) 
    : 0;

  return (
    <Card className="group product-card glass-card overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Link 
            to={`/product/${variant.productId}?variant=${variant.variantId}`} 
            aria-label={`${variant.variantName} ansehen`}
          >
            <OptimizedImage
              src={variant.image}
              alt={variant.variantName}
              className="w-full h-32 sm:h-48 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={handleWishlistToggle}
              aria-label={isInFavorites ? 'Von Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Heart 
                className={`w-4 h-4 ${isInFavorites ? 'fill-red-500 text-red-500' : ''}`} 
              />
            </Button>
          </div>

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {variant.inStock !== false && (
              <Badge variant="secondary" className="text-xs">
                Auf Lager
              </Badge>
            )}
            {hasDiscount && discountPercent > 0 && (
              <Badge variant="destructive" className="text-xs">
                -{discountPercent}%
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <Link 
            to={`/product/${variant.productId}?variant=${variant.variantId}`} 
            className="block"
          >
            <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {variant.variantName}
            </h3>
            
            <p className="text-xs text-muted-foreground mb-2">
              {variant.category}
            </p>

            {variant.rating && variant.rating > 0 && (
              <div className="flex items-center gap-1 mb-2">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground">
                  {variant.rating.toFixed(1)}
                  {variant.reviewCount ? ` (${variant.reviewCount})` : ''}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-3">
              <span className="text-base sm:text-lg font-bold text-primary">
                {variant.price.toFixed(2)} EUR
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {variant.originalPrice!.toFixed(2)} EUR
                </span>
              )}
            </div>
          </Link>

          <div className="flex gap-2">
            <Button 
              className="flex-1 text-xs sm:text-sm"
              variant="outline"
              size="sm"
              asChild
            >
              <Link to={`/product/${variant.productId}?variant=${variant.variantId}`}>
                Ansehen
              </Link>
            </Button>
            <Button 
              size="icon"
              onClick={handleQuickAdd}
              aria-label="In den Warenkorb"
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
