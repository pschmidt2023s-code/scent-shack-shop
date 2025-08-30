import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { perfumes } from '@/data/perfumes';
import { Perfume, PerfumeVariant } from '@/types/perfume';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AuthModal } from '@/components/AuthModal';

interface FavoriteWithDetails {
  id: string;
  perfume: Perfume;
  variant: PerfumeVariant;
  created_at: string;
}

export default function Favorites() {
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();  
  const { user } = useAuth();
  const [favoritesWithDetails, setFavoritesWithDetails] = useState<FavoriteWithDetails[]>([]);

  useEffect(() => {
    // Convert favorites to detailed objects
    const detailed: FavoriteWithDetails[] = [];
    
    favorites.forEach(favorite => {
      const perfume = perfumes.find(p => p.id === favorite.perfume_id);
      if (perfume) {
        if (favorite.variant_id) {
          // Find specific variant
          const variant = perfume.variants.find(v => v.id === favorite.variant_id);
          if (variant) {
            detailed.push({
              id: favorite.id,
              perfume,
              variant,
              created_at: favorite.created_at
            });
          }
        } else {
          // For localStorage compatibility, use first variant
          if (perfume.variants.length > 0) {
            detailed.push({
              id: favorite.id,
              perfume,
              variant: perfume.variants[0],
              created_at: favorite.created_at
            });
          }
        }
      }
    });
    
    setFavoritesWithDetails(detailed);
  }, [favorites]);

  const handleAddToCart = (perfume: Perfume, variant: PerfumeVariant) => {
    addToCart(perfume, variant);
  };

  const handleRemoveFromFavorites = async (perfumeId: string, variantId: string) => {
    await removeFromFavorites(perfumeId, variantId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <LoadingSpinner />
        </div>
        <Footer />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Heart className="w-8 h-8 text-red-500" />
              Meine Favoriten
            </h1>
            <p className="text-muted-foreground">
              {favoritesWithDetails.length} Produkt{favoritesWithDetails.length !== 1 ? 'e' : ''} in Ihren Favoriten
            </p>
          </div>
        </div>

        {/* Auth prompt for guest users */}
        {!user && favoritesWithDetails.length === 0 && (
          <Card className="mb-8">
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Melden Sie sich an für Ihre Favoriten</h3>
              <p className="text-muted-foreground mb-4">
                Speichern Sie Ihre Lieblings-Parfüms dauerhaft und greifen Sie von jedem Gerät darauf zu.
              </p>
              <AuthModal>
                <Button>Jetzt anmelden</Button>
              </AuthModal>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {favoritesWithDetails.length === 0 && user && (
          <Card>
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">Noch keine Favoriten</h3>
              <p className="text-muted-foreground mb-6">
                Fügen Sie Produkte zu Ihren Favoriten hinzu, indem Sie auf das Herz-Symbol klicken.
              </p>
              <Button asChild>
                <Link to="/products">Produkte entdecken</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Favorites grid */}
        {favoritesWithDetails.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritesWithDetails.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative">
                    <Link to={`/product/${item.perfume.id}`}>
                      <img
                        src={item.perfume.image}
                        alt={item.variant.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    
                    {/* Remove from favorites button */}
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      onClick={() => handleRemoveFromFavorites(item.perfume.id, item.variant.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    {/* Stock badge */}
                    <div className="absolute top-2 left-2">
                      <Badge variant={item.variant.inStock ? "secondary" : "destructive"} className="text-xs">
                        {item.variant.inStock ? "Auf Lager" : "Ausverkauft"}
                      </Badge>
                    </div>
                  </div>

                  <div className="p-4">
                    <Link to={`/product/${item.perfume.id}`}>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-1">
                        {item.variant.name}
                      </h3>
                    </Link>
                    
                    <p className="text-sm text-muted-foreground mb-2">#{item.variant.number}</p>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.variant.description}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-bold">€{item.variant.price.toFixed(2)}</span>
                      <Badge variant="outline">{item.perfume.category}</Badge>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleAddToCart(item.perfume, item.variant)}
                        className="flex-1"
                        disabled={!item.variant.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        In den Warenkorb
                      </Button>
                      
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleRemoveFromFavorites(item.perfume.id, item.variant.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Actions */}
        {favoritesWithDetails.length > 0 && (
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link to="/products">Weitere Produkte entdecken</Link>
            </Button>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}