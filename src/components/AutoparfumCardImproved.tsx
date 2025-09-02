import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { useUserRole } from '@/hooks/useUserRole';
import { Perfume } from '@/types/perfume';
import { Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import autoparfumWhite from '@/assets/autoparfum-white.png';
import autoparfumBlack from '@/assets/autoparfum-black.png';

interface AutoparfumCardImprovedProps {
  perfume: Perfume;
}

export function AutoparfumCardImproved({ perfume }: AutoparfumCardImprovedProps) {
  const [selectedScent, setSelectedScent] = useState<string>('399');
  const [selectedColor, setSelectedColor] = useState<string>('black');
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { discount, roleLabel, loading } = useUserRole();

  // Find the current variant based on selected scent and color
  const currentVariant = perfume.variants.find(v => 
    v.number === selectedScent && v.name.toLowerCase().includes(selectedColor)
  ) || perfume.variants[0];

  const averageRating = currentVariant.rating || 0;
  const totalReviews = currentVariant.reviewCount || 0;
  const isInFavorites = isFavorite(perfume.id, currentVariant.id);

  const originalPrice = currentVariant.price;
  const discountedPrice = originalPrice * (1 - discount / 100);

  const getCurrentImage = () => {
    return selectedColor === 'black' ? autoparfumBlack : autoparfumWhite;
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

          {/* Color Selection */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-2 block">Farbe:</label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Farbe wählen" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="black">Schwarz</SelectItem>
                <SelectItem value="white">Weiß</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scent Selection */}
          <div className="mb-3">
            <label className="text-sm font-medium mb-2 block">Duft:</label>
            <Select value={selectedScent} onValueChange={setSelectedScent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Duft wählen" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-lg z-50">
                <SelectItem value="399">ALDENAIR 399</SelectItem>
                <SelectItem value="978">ALDENAIR 978</SelectItem>
                <SelectItem value="999">ALDENAIR 999</SelectItem>
                <SelectItem value="189">ALDENAIR 189</SelectItem>
                <SelectItem value="390">ALDENAIR 390</SelectItem>
                <SelectItem value="275">ALDENAIR 275</SelectItem>
                <SelectItem value="527">ALDENAIR 527</SelectItem>
                <SelectItem value="695">ALDENAIR 695</SelectItem>
              </SelectContent>
            </Select>
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