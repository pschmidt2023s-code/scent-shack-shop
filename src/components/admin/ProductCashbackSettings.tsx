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
  product_id: string;
  variant_number: string;
  price: number;
  cashback_percentage: number;
  in_stock: boolean;
  products?: {
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
      const { data, error } = await supabase
        .from('product_variants')
        .select(`
          *,
          products(name, brand, category)
        `)
        .order('product_id');

      if (error) throw error;

      const variantsWithProducts = (data || []).map((variant: any) => ({
        ...variant,
        products: variant.products || { name: 'Unbekannt', brand: 'Unbekannt', category: 'Unbekannt' }
      }));

      setVariants(variantsWithProducts);
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
      v.products?.name.toLowerCase().includes(query) ||
      v.products?.brand.toLowerCase().includes(query) ||
      v.variant_number.toLowerCase().includes(query)
    );
    setFilteredVariants(filtered);
  };

  const startEdit = (variant: ProductVariant) => {
    setEditingId(variant.id);
    setEditValue(Number(variant.cashback_percentage) || 5.0);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue(0);
  };

  const saveEdit = async (variantId: string) => {
    try {
      // Validierung
      if (editValue < 0 || editValue > 100) {
        toast.error('Cashback-Prozentsatz muss zwischen 0% und 100% liegen');
        return;
      }

      const { error } = await supabase
        .from('product_variants')
        .update({ cashback_percentage: editValue })
        .eq('id', variantId);

      if (error) throw error;

      toast.success('Cashback-Prozentsatz aktualisiert');
      setEditingId(null);
      loadVariants();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating cashback:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  const bulkUpdateCashback = async (percentage: number) => {
    if (!confirm(`Möchtest du den Cashback-Prozentsatz für ALLE Produkte auf ${percentage}% setzen?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('product_variants')
        .update({ cashback_percentage: percentage })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

      if (error) throw error;

      toast.success(`Cashback für alle Produkte auf ${percentage}% gesetzt`);
      loadVariants();
      onUpdate?.();
    } catch (error) {
      console.error('Error bulk updating:', error);
      toast.error('Fehler beim Massen-Update');
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
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => bulkUpdateCashback(3)}
          >
            Alle auf 3%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => bulkUpdateCashback(5)}
          >
            Alle auf 5%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => bulkUpdateCashback(10)}
          >
            Alle auf 10%
          </Button>
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
              <TableHead className="text-right">Cashback €</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVariants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Keine Produkte gefunden
                </TableCell>
              </TableRow>
            ) : (
              filteredVariants.map((variant) => {
                const isEditing = editingId === variant.id;
                const cashbackAmount = (Number(variant.price) * (Number(variant.cashback_percentage) || 0)) / 100;

                return (
                  <TableRow key={variant.id}>
                    <TableCell className="font-medium">
                      {variant.products?.brand} - {variant.products?.name}
                    </TableCell>
                    <TableCell>{variant.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{variant.products?.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{variant.price.toFixed(2)}€</TableCell>
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
                          {Number(variant.cashback_percentage || 0).toFixed(1)}%
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      {cashbackAmount.toFixed(2)}€
                    </TableCell>
                    <TableCell>
                      {variant.in_stock ? (
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
