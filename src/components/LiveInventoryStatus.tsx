import { useEffect, useState } from 'react';
import { AlertCircle, TrendingDown, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

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

    // Set up realtime subscription
    const channel = supabase
      .channel('inventory-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'product_variants',
          filter: `id=eq.${variantId}`,
        },
        (payload) => {
          console.log('Stock updated:', payload);
          const newStock = (payload.new as any).stock || 0;
          setStock(newStock);
          setLowStock(newStock > 0 && newStock <= 5);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [variantId]);

  const fetchStock = async () => {
    try {
      const { data, error } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', variantId)
        .single();

      if (error) throw error;

      const stockQty = data?.stock || 0;
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
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Derzeit nicht verfügbar</AlertDescription>
      </Alert>
    );
  }

  if (lowStock) {
    return (
      <Alert className="mt-4 border-orange-200 bg-orange-50">
        <TrendingDown className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="flex items-center justify-between">
            <span className="font-semibold">Nur noch {stock} auf Lager!</span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              <Clock className="w-3 h-3 mr-1" />
              Begrenzt
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-sm text-green-700 font-medium">{stock} auf Lager</span>
    </div>
  );
}
