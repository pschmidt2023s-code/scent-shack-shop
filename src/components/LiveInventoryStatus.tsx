import { useEffect, useState } from 'react';
import { AlertCircle, TrendingDown, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LiveInventoryStatusProps {
  variantId: string;
  productId: string;
}

export function LiveInventoryStatus({ variantId, productId }: LiveInventoryStatusProps) {
  const [stock, setStock] = useState<number>(0);
  const [lowStock, setLowStock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStock();
    
    const interval = setInterval(fetchStock, 30000);
    return () => clearInterval(interval);
  }, [variantId]);

  const fetchStock = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/variants`, {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch stock');

      const variants = await response.json();
      const variant = variants.find((v: any) => v.id === variantId);
      
      const stockQty = variant?.stock || 0;
      setStock(stockQty);
      setLowStock(stockQty > 0 && stockQty <= 5);
    } catch (error) {
      console.error('Error fetching stock:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;

  if (stock === 0) {
    return (
      <Alert variant="destructive" className="mt-4" data-testid="alert-out-of-stock">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Derzeit nicht verfügbar</AlertDescription>
      </Alert>
    );
  }

  if (lowStock) {
    return (
      <Alert className="mt-4 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950" data-testid="alert-low-stock">
        <TrendingDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        <AlertDescription className="text-orange-800 dark:text-orange-200">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold">Nur noch {stock} auf Lager!</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
              <Clock className="w-3 h-3 mr-1" />
              Begrenzt
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2" data-testid="status-in-stock">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm text-green-700 dark:text-green-400 font-medium">{stock} auf Lager</span>
    </div>
  );
}
