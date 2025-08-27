
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Star, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { perfumes } from '@/data/perfumes';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';
import { PerfumeVariant } from '@/types/perfume';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const perfume = perfumes.find(p => p.id === id);
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant | null>(
    perfume?.variants[0] || null
  );

  if (!perfume) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Produkt nicht gefunden</h1>
          <Button onClick={() => navigate('/')}>
            Zurück zur Startseite
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedVariant?.inStock || !selectedVariant) return;
    
    addToCart(perfume, selectedVariant);
    toast({
      title: "Zum Warenkorb hinzugefügt",
      description: `${selectedVariant.name} wurde erfolgreich hinzugefügt.`,
    });
  };

  const handleVariantChange = (variantId: string) => {
    const variant = perfume.variants.find(v => v.id === variantId);
    setSelectedVariant(variant || null);
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < Math.floor(rating) 
                ? 'fill-luxury-gold text-luxury-gold' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {rating} ({selectedVariant?.reviewCount} Bewertungen)
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="relative">
            <Card className="overflow-hidden">
              <img
                src={perfume.image}
                alt={perfume.name}
                className="w-full h-96 lg:h-[500px] object-cover"
              />
            </Card>
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {selectedVariant?.originalPrice && (
                <Badge variant="destructive" className="bg-luxury-gold text-luxury-black">
                  SALE
                </Badge>
              )}
              {!selectedVariant?.inStock && (
                <Badge variant="secondary">
                  Ausverkauft
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-luxury-gold font-medium text-sm uppercase tracking-wide">
                {perfume.brand}
              </p>
              <h1 className="text-3xl lg:text-4xl font-bold mt-2 mb-4">
                {perfume.name}
              </h1>
              
              {renderStars(selectedVariant?.rating)}
            </div>

            {/* Variant Selection */}
            <div className="space-y-4">
              <Label className="text-xl font-semibold">Duft-Variante wählen</Label>
              <Select value={selectedVariant?.id} onValueChange={handleVariantChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Wählen Sie eine Variante" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg">
                  {perfume.variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id} className="cursor-pointer">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{variant.name}</span>
                          <Badge variant="outline" className="text-xs">
                            Nr. {variant.number}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="font-bold">€{variant.price.toFixed(2)}</span>
                          {variant.originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                              €{variant.originalPrice.toFixed(2)}
                            </span>
                          )}
                          {!variant.inStock && (
                            <Badge variant="secondary" className="text-xs">
                              Ausverkauft
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selected Variant Details */}
            {selectedVariant && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Ausgewählte Variante: {selectedVariant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {selectedVariant.description}
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nummer:</span>
                      <span className="ml-2 font-medium">{selectedVariant.number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Größe:</span>
                      <span className="ml-2 font-medium">{perfume.size}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bewertung:</span>
                      <span className="ml-2 font-medium">{selectedVariant.rating}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verfügbarkeit:</span>
                      <span className="ml-2 font-medium">{selectedVariant.inStock ? 'Auf Lager' : 'Ausverkauft'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1"
                size="lg"
                variant={selectedVariant?.inStock ? "default" : "secondary"}
                onClick={handleAddToCart}
                disabled={!selectedVariant?.inStock}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {selectedVariant?.inStock ? "In den Warenkorb" : "Nicht verfügbar"}
              </Button>
              
              {selectedVariant && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="lg">
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Bewertungen
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Bewertungen - {selectedVariant.name}</DialogTitle>
                    </DialogHeader>
                    <ProductReviews 
                      perfumeId={selectedVariant.id} 
                      perfumeName={selectedVariant.name}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Additional Product Details */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Produktdetails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Allgemeine Informationen</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Marke:</strong> {perfume.brand}</li>
                  <li><strong>Größe:</strong> {perfume.size}</li>
                  <li><strong>Kategorie:</strong> {perfume.category}</li>
                  <li><strong>Varianten:</strong> {perfume.variants.length}</li>
                </ul>
              </div>
              {selectedVariant && (
                <div>
                  <h3 className="font-semibold mb-2">Ausgewählte Variante</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li><strong>Name:</strong> {selectedVariant.name}</li>
                    <li><strong>Nummer:</strong> {selectedVariant.number}</li>
                    <li><strong>Bewertung:</strong> {selectedVariant.rating ? `${selectedVariant.rating}/5 Sterne` : 'Noch keine Bewertungen'}</li>
                    <li><strong>Anzahl Bewertungen:</strong> {selectedVariant.reviewCount || 0}</li>
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
