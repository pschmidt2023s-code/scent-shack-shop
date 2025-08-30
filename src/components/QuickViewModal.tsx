import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ProductImageZoom } from './ProductImageZoom'
import { useCart } from '@/contexts/CartContext'
import { Perfume } from '@/types/perfume'
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface QuickViewModalProps {
  perfume: Perfume | null
  isOpen: boolean
  onClose: () => void
}

export function QuickViewModal({ perfume, isOpen, onClose }: QuickViewModalProps) {
  const [selectedVariant, setSelectedVariant] = useState(0)
  const { addToCart } = useCart()

  if (!perfume) return null

  const currentVariant = perfume.variants[selectedVariant]

  const handleAddToCart = () => {
    addToCart(perfume, currentVariant)
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${currentVariant.name} wurde erfolgreich hinzugefügt.`,
    })
  }

  const handleAddToWishlist = () => {
    toast({
      title: "Zur Wunschliste hinzugefügt",
      description: `${currentVariant.name} wurde zur Wunschliste hinzugefügt.`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Schnellansicht
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <div className="space-y-4">
            <ProductImageZoom
              src={perfume.image}
              alt={currentVariant.name}
              className="aspect-square"
            />
            
            {/* Variant thumbnails if multiple variants */}
            {perfume.variants.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {perfume.variants.map((variant, index) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 rounded-lg overflow-hidden transition-all duration-200 ${
                      selectedVariant === index
                        ? 'border-primary'
                        : 'border-muted-foreground/20'
                    }`}
                  >
                    <img
                      src={perfume.image}
                      alt={variant.name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">{currentVariant.name}</h2>
              <p className="text-muted-foreground">{currentVariant.number}</p>
            </div>

            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-primary">
                €{currentVariant.price.toFixed(2)}
              </span>
              <Badge variant="secondary">{perfume.category}</Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">(4.2 von 5)</span>
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2">Beschreibung</h3>
              <p className="text-sm text-muted-foreground">
                {currentVariant.description}
              </p>
            </div>

            {/* Variant Selection */}
            {perfume.variants.length > 1 && (
              <div>
                <h3 className="font-semibold mb-2">Größe wählen</h3>
                <div className="grid grid-cols-2 gap-2">
                  {perfume.variants.map((variant, index) => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === index ? "default" : "outline"}
                      onClick={() => setSelectedVariant(index)}
                      className="h-auto p-3"
                    >
                      <div className="text-center">
                        <div className="font-semibold">{variant.name.split(' - ')[1]}</div>
                        <div className="text-sm">€{variant.price.toFixed(2)}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" />
                In den Warenkorb
              </Button>
              <Button variant="outline" onClick={handleAddToWishlist}>
                <Heart className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Info */}
            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Lieferzeit:</span>
                <span>3-7 Werktage</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Versand:</span>
                <span>Kostenlos ab 50€</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Verfügbarkeit:</span>
                <span className="text-green-600">Auf Lager</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}