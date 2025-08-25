import { Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Perfume } from '@/types/perfume';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface PerfumeCardProps {
  perfume: Perfume;
  onView?: () => void;
}

export function PerfumeCard({ perfume, onView }: PerfumeCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    if (!perfume.inStock) return;
    
    addToCart(perfume);
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${perfume.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
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
          ({perfume.reviewCount})
        </span>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-luxury transition-all duration-300 cursor-pointer" onClick={onView}>
      <div className="relative overflow-hidden">
        <img
          src={perfume.image}
          alt={perfume.name}
          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {perfume.originalPrice && (
            <Badge variant="destructive" className="bg-luxury-gold text-luxury-black">
              SALE
            </Badge>
          )}
          {!perfume.inStock && (
            <Badge variant="secondary">
              Ausverkauft
            </Badge>
          )}
        </div>

        {/* Quick Add Button */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Button
            size="icon"
            variant="luxury"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!perfume.inStock}
            className="shadow-lg"
          >
            <ShoppingBag className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="space-y-2">
          <p className="text-sm text-luxury-gold font-medium">{perfume.brand}</p>
          <h3 className="font-semibold text-lg group-hover:text-luxury-gold transition-colors">
            {perfume.name}
          </h3>
          
          {renderStars(perfume.rating)}
          
          <p className="text-sm text-muted-foreground line-clamp-2">
            {perfume.description}
          </p>
          
          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-foreground">
                €{perfume.price.toFixed(2)}
              </span>
              {perfume.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  €{perfume.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            
            <Badge variant="outline" className="text-xs">
              {perfume.size}
            </Badge>
          </div>

          <Button 
            className="w-full mt-4"
            variant={perfume.inStock ? "default" : "secondary"}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={!perfume.inStock}
          >
            {perfume.inStock ? "In den Warenkorb" : "Nicht verfügbar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}