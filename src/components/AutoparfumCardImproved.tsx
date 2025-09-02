import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Remove Select imports since we're not using dropdowns anymore
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserRole } from '@/hooks/useUserRole';
import { Perfume } from '@/types/perfume';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import autoparfumWhite from '@/assets/autoparfum-white.png';
import autoparfumBlack from '@/assets/autoparfum-black.png';
import autoparfumProduct from '@/assets/autoparfum-product.png';

interface AutoparfumCardImprovedProps {
  perfume: Perfume;
}

export function AutoparfumCardImproved({ perfume }: AutoparfumCardImprovedProps) {
  console.log('AutoparfumCardImproved: Rendering with perfume:', perfume.name);
  
  const [selectedScent, setSelectedScent] = useState<string>('399');
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { discount, roleLabel, loading } = useUserRole();

  console.log('AutoparfumCardImproved: Hook values - discount:', discount, 'roleLabel:', roleLabel, 'loading:', loading);

  // Find the current variant based on selected scent and color
  const currentVariant = perfume.variants.find(v => 
    v.number === selectedScent && v.name.toLowerCase().includes(selectedColor)
  ) || perfume.variants[0];

  console.log('AutoparfumCardImproved: Current variant:', currentVariant);

  // Safety check to prevent white screen
  if (!currentVariant) {
    console.error('AutoparfumCardImproved: No variant found for perfume:', perfume);
    return <div>Error: No variant found</div>;
  }

  const averageRating = currentVariant.rating || 0;
  const totalReviews = currentVariant.reviewCount || 0;
  const isInFavorites = isFavorite(perfume.id, currentVariant.id);

  const originalPrice = currentVariant.price;
  const discountedPrice = originalPrice * (1 - discount / 100);

  const getCurrentImage = () => {
    return autoparfumProduct; // Use the correct product image you provided
  };

  const handleAddToCart = () => {
    addToCart(perfume, {
      ...currentVariant,
      price: discount > 0 ? discountedPrice : originalPrice
    });
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${currentVariant.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleWishlistToggle = async () => {
    await toggleFavorite(perfume.id, currentVariant.id);
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${perfume.id}`}>
            <img
              src={getCurrentImage()}
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
            <Badge variant="secondary" className="text-xs">
              Auf Lager
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <Link to={`/product/${perfume.id}`}>
            <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
              {perfume.name}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground mb-2">{selectedScent}</p>
          
          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
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

          {/* Price with Discount */}
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

          {/* Variant Selection - Button Style like other products */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {/* Color Selection Buttons */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor('black');
                }}
                className={`px-2 py-1 text-xs border rounded transition-colors ${
                  selectedColor === 'black'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/20 hover:border-primary'
                }`}
              >
                Schwarz
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedColor('white');
                }}
                className={`px-2 py-1 text-xs border rounded transition-colors ${
                  selectedColor === 'white'
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground/20 hover:border-primary'
                }`}
              >
                Weiß
              </button>
            </div>
          </div>

          {/* Scent Selection Buttons */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {['399', '978', '999', '189', '390', '275', '527', '695'].map((scent) => (
                <button
                  key={scent}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedScent(scent);
                  }}
                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                    selectedScent === scent
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/20 hover:border-primary'
                  }`}
                >
                  ALDENAIR {scent}
                </button>
              ))}
            </div>
          </div>

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
  );
}