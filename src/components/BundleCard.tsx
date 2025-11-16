import { Package, ShoppingCart, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BundleProduct {
  id: string;
  name: string;
  image: string;
  quantity: number;
}

interface BundleCardProps {
  id: string;
  name: string;
  description: string;
  products: BundleProduct[];
  totalPrice: number;
  discountPercentage: number;
  originalPrice: number;
  onAddToCart: () => void;
}

export function BundleCard({
  name,
  description,
  products,
  totalPrice,
  discountPercentage,
  originalPrice,
  onAddToCart,
}: BundleCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow relative overflow-hidden">
      {/* Sparkle Effect */}
      <div className="absolute top-4 right-4">
        <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
      </div>

      <div className="flex items-start gap-2 mb-4">
        <Package className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="text-xl font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Products in Bundle */}
      <div className="space-y-2 mb-4">
        {products.map((product, index) => (
          <div key={index} className="flex items-center gap-3 text-sm">
            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1">
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-muted-foreground">Menge: {product.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pricing */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground line-through">€{originalPrice.toFixed(2)}</span>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            -{discountPercentage}% Ersparnis
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Bundle-Preis:</span>
          <span className="text-2xl font-bold text-primary">€{totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={onAddToCart} className="w-full mt-4 gap-2" size="lg">
        <ShoppingCart className="w-4 h-4" />
        Bundle in den Warenkorb
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-2">
        Spare €{(originalPrice - totalPrice).toFixed(2)} mit diesem Bundle!
      </p>
    </Card>
  );
}
