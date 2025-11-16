import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, ShoppingCart, Heart } from 'lucide-react';
import { Perfume } from '@/types/perfume';
import { useProductComparison } from '@/hooks/useProductComparison';
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/hooks/useFavorites';
import { OptimizedImage } from '@/components/OptimizedImage';
import { toast } from '@/hooks/use-toast';

interface ComparisonRow {
  label: string;
  getValue: (perfume: Perfume) => string | number;
  highlight?: boolean;
}

const comparisonRows: ComparisonRow[] = [
  {
    label: 'Marke',
    getValue: (p) => p.brand,
    highlight: true
  },
  {
    label: 'Kategorie',
    getValue: (p) => p.category
  },
  {
    label: 'Größe',
    getValue: (p) => p.size
  },
  {
    label: 'Preis',
    getValue: (p) => `${p.variants[0].price.toFixed(2)}€`,
    highlight: true
  },
  {
    label: 'Original Preis',
    getValue: (p) => p.variants[0].originalPrice ? `${p.variants[0].originalPrice.toFixed(2)}€` : '-'
  },
  {
    label: 'Bewertung',
    getValue: (p) => `${p.variants[0].rating || 0} ⭐`,
    highlight: true
  },
  {
    label: 'Bewertungen',
    getValue: (p) => `${p.variants[0].reviewCount || 0} Bewertungen`
  },
  {
    label: 'Verfügbarkeit',
    getValue: (p) => p.variants[0].inStock ? '✓ Auf Lager' : '✗ Ausverkauft',
    highlight: true
  }
];

export function ProductComparisonDetail() {
  const { comparisonItems, removeFromComparison, clearComparison } = useProductComparison();
  const { addToCart } = useCart();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();

  if (comparisonItems.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Keine Produkte zum Vergleichen ausgewählt
          </p>
          <Button onClick={() => window.history.back()}>
            Zurück zu Produkten
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Produktvergleich</h2>
          <p className="text-muted-foreground">
            {comparisonItems.length} {comparisonItems.length === 1 ? 'Produkt' : 'Produkte'} ausgewählt
          </p>
        </div>
        {comparisonItems.length > 0 && (
          <Button variant="outline" onClick={clearComparison}>
            Alle entfernen
          </Button>
        )}
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="sticky left-0 bg-card z-10 px-4 py-3 text-left font-medium">
                      Eigenschaft
                    </th>
                    {comparisonItems.map((item) => (
                      <th key={item.id} className="px-4 py-3 min-w-[250px]">
                        <div className="space-y-3">
                          <div className="relative">
                            <OptimizedImage
                              src={item.image}
                              alt={item.name}
                              className="w-full h-48 object-cover rounded-lg"
                              width={250}
                              height={192}
                            />
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute top-2 right-2"
                              onClick={() => removeFromComparison(item.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm">{item.name}</h3>
                            <p className="text-xs text-muted-foreground">{item.brand}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                addToCart(item, item.variants[0]);
                                toast({
                                  title: "Zum Warenkorb hinzugefügt",
                                  description: `${item.name} wurde hinzugefügt.`,
                                });
                              }}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Kaufen
                            </Button>
                            <Button
                              size="sm"
                              variant={isFavorite(item.id, item.variants[0].id) ? "default" : "outline"}
                              onClick={async () => {
                                if (isFavorite(item.id, item.variants[0].id)) {
                                  await removeFromFavorites(item.id, item.variants[0].id);
                                } else {
                                  await addToFavorites(item.id, item.variants[0].id);
                                }
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row, index) => (
                    <tr
                      key={row.label}
                      className={`border-b ${row.highlight ? 'bg-accent/5' : ''}`}
                    >
                      <td className="sticky left-0 bg-card z-10 px-4 py-3 font-medium">
                        {row.label}
                      </td>
                      {comparisonItems.map((item) => (
                        <td key={item.id} className="px-4 py-3 text-center">
                          {row.getValue(item)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
