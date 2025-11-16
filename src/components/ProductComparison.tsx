import { X, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProductComparison } from '@/hooks/useProductComparison';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Link } from 'react-router-dom';

export function ProductComparison() {
  const { comparisonItems, removeFromComparison, clearComparison } = useProductComparison();

  if (comparisonItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 max-w-sm">
      <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Produktvergleich</h3>
            <Badge variant="secondary">{comparisonItems.length}</Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearComparison}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3 mb-4">
          {comparisonItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3 group">
              <OptimizedImage
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-md"
                width={48}
                height={48}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.brand}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromComparison(item.id)}
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>

        <Link to="/products?compare=true">
          <Button className="w-full" size="sm">
            Vergleichen ({comparisonItems.length})
          </Button>
        </Link>
      </Card>
    </div>
  );
}
