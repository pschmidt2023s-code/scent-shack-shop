
import { useParams, useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingBag, ArrowLeft, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { allPerfumes } from '@/data/perfumes';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const perfume = allPerfumes.find(p => p.id === id);

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
            className={`w-5 h-5 ${
              i < Math.floor(rating) 
                ? 'fill-luxury-gold text-luxury-gold' 
                : 'text-muted-foreground'
            }`}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {rating} ({perfume.reviewCount} Bewertungen)
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
              
              {renderStars(perfume.rating)}
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-foreground">
                €{perfume.price.toFixed(2)}
              </span>
              {perfume.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  €{perfume.originalPrice.toFixed(2)}
                </span>
              )}
              <Badge variant="outline" className="ml-auto">
                {perfume.size}
              </Badge>
            </div>

            {/* Category */}
            <div>
              <Badge variant="secondary" className="text-sm">
                {perfume.category}
              </Badge>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Beschreibung</h2>
              <p className="text-muted-foreground leading-relaxed">
                {perfume.description}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                className="flex-1"
                size="lg"
                variant={perfume.inStock ? "default" : "secondary"}
                onClick={handleAddToCart}
                disabled={!perfume.inStock}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {perfume.inStock ? "In den Warenkorb" : "Nicht verfügbar"}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="lg">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Bewertungen
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Bewertungen - {perfume.name}</DialogTitle>
                  </DialogHeader>
                  <ProductReviews 
                    perfumeId={perfume.id} 
                    perfumeName={perfume.name}
                  />
                </DialogContent>
              </Dialog>
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
                  <li><strong>Verfügbarkeit:</strong> {perfume.inStock ? 'Auf Lager' : 'Ausverkauft'}</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Bewertung</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li><strong>Durchschnittsbewertung:</strong> {perfume.rating ? `${perfume.rating}/5 Sterne` : 'Noch keine Bewertungen'}</li>
                  <li><strong>Anzahl Bewertungen:</strong> {perfume.reviewCount || 0}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default ProductDetail;
