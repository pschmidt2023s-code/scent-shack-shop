import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserRole } from '@/hooks/useUserRole';
import { useCart } from '@/contexts/CartContext';
import { Perfume } from '@/types/perfume';
import { Link } from 'react-router-dom';

interface PerfumeCardProps {
  perfume: Perfume;
}

export function PerfumeCard({ perfume }: PerfumeCardProps) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { discount, roleLabel, loading, isNewsletterSubscriber } = useUserRole();
  const { addToCart } = useCart();

  // Use first variant for display
  const displayVariant = perfume.variants[0];
  const isInFavorites = isFavorite(perfume.id, displayVariant.id);

  // Calculate price range
  const prices = perfume.variants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = minPrice !== maxPrice ? `€${minPrice.toFixed(2)} - €${maxPrice.toFixed(2)}` : `€${minPrice.toFixed(2)}`;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isInFavorites) {
      await removeFromFavorites(perfume.id, displayVariant.id);
    } else {
      await addToFavorites(perfume.id, displayVariant.id);
    }
  };

  const handleProductClick = () => {
    console.log('Product clicked:', perfume.name);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(perfume, displayVariant);
  };

  // Display collection name based on category
  const collectionName = perfume.category === 'Autoparfüm Collection' 
    ? 'Autoparfüm Collection' 
    : perfume.category === '50ML Bottles'
    ? '50ML Flakons'
    : perfume.category;

  return (
    <Card className="group glass-card transition-shadow duration-200 overflow-hidden hover:shadow-glow">
      <CardContent className="p-0">
        <div className="relative">
          <Link 
            to={`/product/${perfume.id}`} 
            onClick={handleProductClick}
            aria-label={`${collectionName} Kollektion ansehen`}
          >
            <img
              src={perfume.image}
              alt={`${collectionName} - ${perfume.brand} Parfüm Kollektion`}
              className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              decoding="async"
              role="img"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'translateZ(0)'
              }}
            />
          </Link>
          
          {/* Wishlist Button */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0"
              onClick={handleWishlistToggle}
              aria-label={isInFavorites ? `${collectionName} von Favoriten entfernen` : `${collectionName} zu Favoriten hinzufügen`}
              title={isInFavorites ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
            >
              <Heart 
                className={`w-4 h-4 ${isInFavorites ? 'fill-red-500 text-red-500' : ''}`} 
                aria-hidden="true"
              />
            </Button>
          </div>

          {/* Stock Badge */}
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="text-xs">
              Auf Lager
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <Link 
            to={`/product/${perfume.id}`} 
            onClick={handleProductClick}
            className="block"
            aria-label={`${collectionName} Kollektion ansehen`}
          >
            <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
              {collectionName}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              {perfume.variants.length} {perfume.variants.length === 1 ? 'Duft' : 'Düfte'} verfügbar
            </p>

            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xl font-bold text-primary">{priceRange}</span>
              </div>
              <Badge variant="secondary">{perfume.category}</Badge>
            </div>

            <div className="flex gap-2">
              <Button 
                className="flex-1"
                variant="outline"
                aria-label={`${collectionName} Produkt ansehen`}
                data-testid={`btn-view-product-${perfume.id}`}
              >
                Produkt ansehen
              </Button>
              <Button 
                size="icon"
                onClick={handleQuickAdd}
                aria-label={`${collectionName} in den Warenkorb`}
                data-testid={`btn-quick-add-${perfume.id}`}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}