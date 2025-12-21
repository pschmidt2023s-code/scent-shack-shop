
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CustomerReviews } from '@/components/CustomerReviews';
import { ProductImageZoom } from '@/components/ProductImageZoom';
import { StockStatus } from '@/components/StockStatus';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Star, ShoppingBag, ArrowLeft, MessageCircle, Loader2, Sparkles, Leaf, Sun, CloudSnow, TreeDeciduous, Calendar, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { ProductReviews } from '@/components/ProductReviews';
import { Perfume, PerfumeVariant } from '@/types/perfume';
import { WhatsAppCommerce } from '@/components/WhatsAppCommerce';
import { ARProductViewer } from '@/components/ARProductViewer';
import { SubscriptionButton } from '@/components/SubscriptionButton';
import { useQuery } from '@tanstack/react-query';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toast } = useToast();
  
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<PerfumeVariant | null>(null);
  
  const { data: user } = useQuery<{ id: string; email: string } | null>({
    queryKey: ['/api/user'],
  });

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          console.error('Product not found');
          setPerfume(null);
          return;
        }
        const data = await response.json();
        if (data) {
          const transformed: Perfume = {
            id: data.id,
            name: data.name,
            brand: data.brand || 'ALDENAIR',
            category: data.category,
            size: data.size,
            image: data.image || '/placeholder.svg',
            description: data.description,
            scentNotes: data.scentNotes,
            topNotes: data.topNotes,
            middleNotes: data.middleNotes,
            baseNotes: data.baseNotes,
            ingredients: data.ingredients,
            inspiredBy: data.inspiredBy,
            aiDescription: data.aiDescription,
            seasons: data.seasons,
            occasions: data.occasions,
            variants: (data.variants || []).map((v: any, index: number) => ({
              id: v.id,
              number: String(index + 1).padStart(3, '0'),
              name: v.name,
              description: v.description,
              size: v.size,
              price: parseFloat(v.price) || 0,
              originalPrice: parseFloat(v.originalPrice) || parseFloat(v.price) * 1.2 || 0,
              inStock: v.inStock ?? true,
              preorder: v.preorder ?? false,
              releaseDate: v.releaseDate,
              rating: v.rating ?? 4.5,
              reviewCount: v.reviewCount ?? 0,
              topNotes: v.topNotes,
              middleNotes: v.middleNotes,
              baseNotes: v.baseNotes,
              ingredients: v.ingredients,
              image: v.image,
              aiDescription: v.aiDescription,
            })),
          };
          setPerfume(transformed);
          if (transformed.variants.length > 0) {
            setSelectedVariant(transformed.variants[0]);
          }
        }
      } catch (error) {
        console.error('Error loading product:', error);
        setPerfume(null);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen glass">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-4 text-muted-foreground">Produkt wird geladen...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!perfume) {
    return (
      <div className="min-h-screen glass">
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
    if (!selectedVariant) return;
    
    // Allow pre-order for THREED collection even if not in stock
    const isThreedCollection = perfume.id === "threed-collection";
    if (!isThreedCollection && !selectedVariant.inStock) return;
    
    addToCart(perfume, selectedVariant);
    toast({
      title: isThreedCollection ? "Zur Vorbestellung hinzugefügt" : "Zum Warenkorb hinzugefügt",
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
      </div>
    );
  };

  // Get rating data from variant
  const variantRating = selectedVariant ? { 
    rating: selectedVariant.rating || 4.5, 
    count: selectedVariant.reviewCount || 0 
  } : null;

  return (
    <div className="min-h-screen glass pb-20 md:pb-0">
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
              
              {variantRating && variantRating.count > 0 ? (
                <div className="flex items-center space-x-1">
                  {renderStars(variantRating.rating)}
                  <span className="text-sm text-muted-foreground ml-2">
                    {variantRating.rating.toFixed(1)} ({variantRating.count} Bewertungen)
                  </span>
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">Noch keine Bewertungen</span>
              )}
            </div>

            {/* Variant Selection - Hidden for THREED collection */}
            {perfume.id !== "threed-collection" && (
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
            )}

            {/* Selected Variant Details */}
            {selectedVariant && (
              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">{selectedVariant.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {selectedVariant.description}
                  </p>
                  {selectedVariant.inspiredBy && (
                    <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <span className="text-sm font-semibold text-primary">Riecht wie:</span>
                      <span className="ml-2 text-sm font-medium">{selectedVariant.inspiredBy}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nummer:</span>
                      <span className="ml-2 font-medium">{selectedVariant.number}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Größe:</span>
                      <span className="ml-2 font-medium">{selectedVariant.size || perfume.size || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bewertung:</span>
                      <span className="ml-2 font-medium">
                        {variantRating && variantRating.count > 0 
                          ? `${variantRating.rating.toFixed(1)}/5` 
                          : 'Keine Bewertungen'
                        }
                      </span>
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
                variant="default"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {perfume.id === "threed-collection" ? "Jetzt vorbestellen" : 
                 selectedVariant?.inStock ? "In den Warenkorb" : "Nicht verfügbar"}
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
                      perfumeId={perfume.id}
                      variantId={selectedVariant.id} 
                      perfumeName={selectedVariant.name}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Subscription Option */}
            {selectedVariant && selectedVariant.inStock && (
              <div className="pt-2">
                <SubscriptionButton
                  variantId={selectedVariant.id}
                  variantName={selectedVariant.name}
                  price={selectedVariant.price}
                  isLoggedIn={!!user}
                />
              </div>
            )}
          </div>
        </div>

        {/* Scent Information Section */}
        {(() => {
          // Use variant data if available, otherwise fall back to product data
          const topNotes = selectedVariant?.topNotes?.length ? selectedVariant.topNotes : perfume.topNotes;
          const middleNotes = selectedVariant?.middleNotes?.length ? selectedVariant.middleNotes : perfume.middleNotes;
          const baseNotes = selectedVariant?.baseNotes?.length ? selectedVariant.baseNotes : perfume.baseNotes;
          const ingredients = selectedVariant?.ingredients?.length ? selectedVariant.ingredients : perfume.ingredients;
          const aiDescription = selectedVariant?.aiDescription || perfume.aiDescription;
          const hasNotes = topNotes?.length || middleNotes?.length || baseNotes?.length;
          const hasScentInfo = hasNotes || perfume.scentNotes?.length || perfume.inspiredBy || aiDescription || perfume.seasons?.length || perfume.occasions?.length || ingredients?.length;
          
          if (!hasScentInfo) return null;
          
          return (
          <Card className="mb-12" data-testid="card-scent-info">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Duftprofil</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* AI Description */}
                  {aiDescription && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Award className="w-4 h-4 text-primary" />
                        Beschreibung
                      </h3>
                      <p className="text-muted-foreground leading-relaxed" data-testid="text-ai-description">
                        {aiDescription}
                      </p>
                    </div>
                  )}

                  {/* Inspired By */}
                  {perfume.inspiredBy && (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h3 className="font-semibold mb-2 text-primary">Inspiriert von</h3>
                      <p className="text-lg font-medium" data-testid="text-inspired-by">{perfume.inspiredBy}</p>
                    </div>
                  )}

                  {/* Fragrance Notes Pyramid */}
                  {hasNotes && (
                    <div className="space-y-4">
                      {topNotes && topNotes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Kopfnoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {topNotes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {middleNotes && middleNotes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Herznoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {middleNotes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {baseNotes && baseNotes.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 text-sm text-muted-foreground">Basisnoten</h4>
                          <div className="flex flex-wrap gap-2">
                            {baseNotes.map((note) => (
                              <Badge key={note} variant="secondary" className="text-sm">{note}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Legacy Scent Notes (fallback) */}
                  {!hasNotes && perfume.scentNotes && perfume.scentNotes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Duftnoten
                      </h3>
                      <div className="flex flex-wrap gap-2" data-testid="container-scent-notes">
                        {perfume.scentNotes.map((note) => (
                          <Badge key={note} variant="secondary" className="text-sm">
                            {note}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ingredients */}
                  {ingredients && ingredients.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Inhaltsstoffe
                      </h3>
                      <div className="flex flex-wrap gap-2" data-testid="container-ingredients">
                        {ingredients.map((ingredient) => (
                          <Badge key={ingredient} variant="outline" className="text-sm">
                            {ingredient}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Seasons */}
                  {perfume.seasons && perfume.seasons.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Sun className="w-4 h-4" />
                        Passende Jahreszeiten
                      </h3>
                      <div className="flex flex-wrap gap-2" data-testid="container-seasons">
                        {perfume.seasons.map((season) => {
                          const SeasonIcon = season === 'Frühling' ? Leaf : 
                                           season === 'Sommer' ? Sun :
                                           season === 'Herbst' ? TreeDeciduous : CloudSnow;
                          return (
                            <Badge key={season} variant="outline" className="gap-1.5">
                              <SeasonIcon className="w-3 h-3" />
                              {season}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Occasions */}
                  {perfume.occasions && perfume.occasions.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Passende Anlässe
                      </h3>
                      <div className="flex flex-wrap gap-2" data-testid="container-occasions">
                        {perfume.occasions.map((occasion) => (
                          <Badge key={occasion} variant="outline">
                            {occasion}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          );
        })()}

        {/* Additional Product Details */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-4">Produktdetails</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Allgemeine Informationen</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p><strong>Marke:</strong> {perfume.brand}</p>
                  <p><strong>Größe:</strong> {selectedVariant?.size || perfume.size || '-'}</p>
                  <p><strong>Kategorie:</strong> {perfume.category}</p>
                  <p><strong>Varianten:</strong> {perfume.variants.length}</p>
                </div>
              </div>
              {selectedVariant && (
                <div>
                  <h3 className="font-semibold mb-2">Ausgewählte Variante</h3>
                  <div className="space-y-2 text-muted-foreground">
                    <p><strong>Name:</strong> {selectedVariant.name}</p>
                    <p><strong>Nummer:</strong> {selectedVariant.number}</p>
                    {selectedVariant.inspiredBy && (
                      <p><strong>Riecht wie:</strong> {selectedVariant.inspiredBy}</p>
                    )}
                    <p><strong>Bewertung:</strong> {variantRating && variantRating.count > 0 ? `${variantRating.rating.toFixed(1)}/5 Sterne` : 'Noch keine Bewertungen'}</p>
                    <p><strong>Anzahl Bewertungen:</strong> {variantRating?.count || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer Reviews Section */}
        <CustomerReviews 
          perfumeId={perfume.id}
          variantId={selectedVariant?.id}
          className="mb-12"
        />

        {/* New Features Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp Commerce */}
          {selectedVariant && (
            <WhatsAppCommerce perfume={perfume} variant={selectedVariant} />
          )}
          
          {/* AR Product Viewer */}
          <ARProductViewer perfume={perfume} />
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ProductDetail;
