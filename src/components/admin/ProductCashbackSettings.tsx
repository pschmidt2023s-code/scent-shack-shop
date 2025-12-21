import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Edit2, Save, X, Search } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  productId: string;
  price: string;
  cashbackPercentage: number;
  inStock: boolean;
  product?: {
    name: string;
    brand: string;
    category: string;
  };
}

interface ProductCashbackSettingsProps {
  onUpdate?: () => void;
}

export function ProductCashbackSettings({ onUpdate }: ProductCashbackSettingsProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [filteredVariants, setFilteredVariants] = useState<ProductVariant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    loadVariants();
  }, []);

  useEffect(() => {
    filterVariants();
  }, [searchQuery, variants]);

  const loadVariants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/variants', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setVariants(data || []);
      } else {
        setVariants([]);
      }
    } catch (error) {
      console.error('Error loading variants:', error);
      toast.error('Fehler beim Laden der Produkte');
    } finally {
      setLoading(false);
    }
  };

  const filterVariants = () => {
    if (!searchQuery.trim()) {
      setFilteredVariants(variants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = variants.filter(v => 
      v.name.toLowerCase().includes(query) ||
      v.product?.name?.toLowerCase().includes(query) ||
      v.product?.brand?.toLowerCase().includes(query)
    );
    setFilteredVariants(filtered);
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setEditValue(Number(variant.cashbackPercentage) || 5.0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveEdit = async (variantId: string) => {
    try {
      if (editValue < 0 || editValue > 100) {
        toast.error('Cashback-Prozentsatz muss zwischen 0% und 100% liegen');
        return;
      }

      const response = await fetch(`/api/admin/variants/${variantId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cashbackPercentage: editValue }),
      });

      if (!response.ok) throw new Error('Failed to update');

      toast.success('Cashback-Prozentsatz aktualisiert');
      setEditingId(null);
      loadVariants();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating cashback:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Lädt Produkte...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Suche nach Produktname, Marke, Variante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-variants"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produkt</TableHead>
              <TableHead>Variante</TableHead>
              <TableHead>Kategorie</TableHead>
              <TableHead className="text-right">Preis</TableHead>
              <TableHead className="text-right">Cashback %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Keine Produkte gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredVariants.map((variant) => {
                const isEditing = editingId === variant.id;
                const price = parseFloat(variant.price) || 0;

                return (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">
                      {variant.product?.brand} - {variant.product?.name}
                    </TableCell>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{variant.product?.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{price.toFixed(2)}EUR</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={editValue}
                          onChange={(e) => setEditValue(Number(e.target.value))}
                          className="w-20 text-right"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-primary">
                          {Number(variant.cashbackPercentage || 0).toFixed(1)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {variant.inStock ? (
                        <Badge variant="default" className="bg-green-500">Verfügbar</Badge>
                      ) : (
                        <Badge variant="secondary">Nicht verfügbar</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => saveEdit(variant.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={cancelEdit}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(variant)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Zeige {filteredVariants.length} von {variants.length} Produkten
      </div>
    </div>
  );
}
