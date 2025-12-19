import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, ShoppingCart, Loader2, Filter, Grid3X3, List, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useFavorites } from '@/hooks/useFavorites';
import { useCart } from '@/contexts/CartContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ProductVariant {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice?: string;
  inStock: boolean;
  stock: number;
  size: string;
  inspiredByFragrance?: string;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  image: string;
  inspiredBy: string | null;
  scentNotes: string[] | null;
  topNotes: string[] | null;
  middleNotes: string[] | null;
  baseNotes: string[] | null;
  variants: ProductVariant[];
}

function ProductCard({ product }: { product: Product }) {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();
  
  const variant = product.variants[0];
  const isInFavorites = variant ? isFavorite(product.id, variant.id) : false;
  const price = variant ? parseFloat(variant.price) : 0;

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    if (isInFavorites) {
      await removeFromFavorites(product.id, variant.id);
    } else {
      await addToFavorites(product.id, variant.id);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    addToCart({
      id: product.id,
      name: product.name,
      brand: product.brand || 'ALDENAIR',
      category: product.category,
      size: variant.size || '50ml',
      image: product.image || '/placeholder.svg',
      variants: [{
        id: variant.id,
        number: '001',
        name: variant.name,
        description: variant.description || '',
        price: parseFloat(variant.price),
        inStock: variant.inStock,
        rating: 4.5,
        reviewCount: 0,
      }]
    }, {
      id: variant.id,
      number: '001',
      name: variant.name,
      description: variant.description || '',
      price: parseFloat(variant.price),
      inStock: variant.inStock,
      rating: 4.5,
      reviewCount: 0,
    });
  };

  return (
    <Card className="group glass-card transition-shadow duration-200 overflow-hidden hover:shadow-glow" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-0">
        <div className="relative">
          <Link to={`/product/${product.id}`}>
            <OptimizedImage
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-40 sm:h-52 transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8"
              onClick={handleWishlistToggle}
              data-testid={`btn-favorite-${product.id}`}
            >
              <Heart className={`w-4 h-4 ${isInFavorites ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {variant?.inStock ? (
              <Badge variant="secondary" className="text-xs">Auf Lager</Badge>
            ) : (
              <Badge variant="destructive" className="text-xs">Ausverkauft</Badge>
            )}
            {product.inspiredBy && (
              <Badge variant="outline" className="text-xs bg-background/80 backdrop-blur-sm">
                <Sparkles className="w-3 h-3 mr-1" />
                Inspiriert
              </Badge>
            )}
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-sm sm:text-base mb-1 group-hover:text-primary transition-colors line-clamp-1" data-testid={`text-name-${product.id}`}>
              {product.name}
            </h3>
            
            {product.inspiredBy && (
              <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                Inspiriert von {product.inspiredBy}
              </p>
            )}
            
            {variant && (
              <p className="text-xs text-muted-foreground mb-2">
                {variant.size || '50ml'}
              </p>
            )}

            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-base sm:text-lg font-bold text-primary" data-testid={`text-price-${product.id}`}>
                {price.toFixed(2).replace('.', ',')} EUR
              </span>
            </div>
          </Link>

          <div className="flex gap-2">
            <Button 
              className="flex-1 text-xs sm:text-sm"
              variant="outline"
              size="sm"
              asChild
              data-testid={`btn-view-${product.id}`}
            >
              <Link to={`/product/${product.id}`}>Ansehen</Link>
            </Button>
            <Button
              size="icon"
              variant="default"
              onClick={handleQuickAdd}
              disabled={!variant?.inStock}
              data-testid={`btn-cart-${product.id}`}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Products() {
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  const [sortBy, setSortBy] = useState('name');

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', categoryFilter],
    queryFn: async () => {
      const url = categoryFilter 
        ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
        : '/api/products';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch products');
      return res.json();
    }
  });

  const getCategoryTitle = () => {
    switch (categoryFilter) {
      case '50ML Bottles':
        return { title: 'ALDENAIR Prestige Edition', description: 'Exklusive 50ml Parfüm-Flakons der Premium-Kollektion' };
      case 'Proben':
        return { title: 'ALDENAIR Proben Kollektion', description: 'Entdecke alle Düfte in praktischen 5ml Proben' };
      case 'Testerkits':
        return { title: 'ALDENAIR Testerkits', description: 'Komplette Sets zum Kennenlernen' };
      default:
        return { title: 'ALDENAIR Parfüm-Kollektion', description: 'Entdecke unsere komplette Parfüm-Kollektion' };
    }
  };

  const { title: pageTitle, description: pageDescription } = getCategoryTitle();

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.variants[0]?.price || '0') - parseFloat(b.variants[0]?.price || '0');
      case 'price-high':
        return parseFloat(b.variants[0]?.price || '0') - parseFloat(a.variants[0]?.price || '0');
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <Navigation />
      
      <main>
        <section className="bg-gradient-primary text-primary-foreground py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-4">
                <Breadcrumb 
                  items={[{ label: 'Parfüms', isActive: true }]} 
                  className="text-primary-foreground/80"
                />
              </div>
              
              <div className="animate-slide-up">
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3">
                  {pageTitle}
                </h1>
                <p className="text-base sm:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-4">
                  {pageDescription}
                </p>
                
                <p className="text-sm sm:text-lg text-primary-foreground/90">
                  {products.length} Produkte verfügbar
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{products.length} Produkte</span>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]" data-testid="select-sort">
                    <SelectValue placeholder="Sortieren" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Preis aufsteigend</SelectItem>
                    <SelectItem value="price-high">Preis absteigend</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : sortedProducts.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-lg text-muted-foreground">Keine Produkte gefunden</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  {sortedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
