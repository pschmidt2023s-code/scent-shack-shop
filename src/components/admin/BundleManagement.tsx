import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Bundle {
  id: string;
  name: string;
  description: string;
  total_price: number;
  discount_percentage: number;
  is_active: boolean;
  quantity_required: number;
}

export function BundleManagement() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    total_price: 0,
    discount_percentage: 0,
    quantity_required: 3
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bundle_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBundles(data || []);
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Fehler beim Laden der Bundles');
    } finally {
      setLoading(false);
    }
  };

  const toggleBundleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('bundle_products')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Bundle-Status aktualisiert');
      fetchBundles();
    } catch (error) {
      console.error('Error toggling bundle:', error);
      toast.error('Fehler beim Aktualisieren');
    }
  };

  const deleteBundle = async (id: string) => {
    if (!confirm('Bundle wirklich löschen?')) return;

    try {
      const { error } = await supabase.from('bundle_products').delete().eq('id', id);

      if (error) throw error;
      toast.success('Bundle gelöscht');
      fetchBundles();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const handleSaveBundle = async () => {
    try {
      // Validate required fields
      if (!formData.name || !formData.total_price || formData.discount_percentage === undefined) {
        toast.error('Bitte fülle alle Pflichtfelder aus');
        return;
      }

      if (editBundle) {
        const { error } = await supabase
          .from('bundle_products')
          .update({
            name: formData.name,
            description: formData.description,
            total_price: formData.total_price,
            discount_percentage: formData.discount_percentage,
            quantity_required: formData.quantity_required
          })
          .eq('id', editBundle.id);
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        toast.success('Bundle aktualisiert');
      } else {
        const { error } = await supabase
          .from('bundle_products')
          .insert([{
            name: formData.name,
            description: formData.description,
            total_price: formData.total_price,
            discount_percentage: formData.discount_percentage,
            quantity_required: formData.quantity_required,
            is_active: true
          }]);
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        toast.success('Bundle erstellt');
      }
      setCreateOpen(false);
      setEditBundle(null);
      setFormData({ name: '', description: '', total_price: 0, discount_percentage: 0, quantity_required: 3 });
      fetchBundles();
    } catch (error: any) {
      console.error('Error saving bundle:', error);
      toast.error(`Fehler beim Speichern: ${error.message || 'Unbekannter Fehler'}`);
    }
  };

  const handleEditBundle = (bundle: Bundle) => {
    setEditBundle(bundle);
    setFormData({
      name: bundle.name,
      description: bundle.description || '',
      total_price: bundle.total_price,
      discount_percentage: bundle.discount_percentage,
      quantity_required: bundle.quantity_required || 3
    });
    setCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bundle-Verwaltung</h2>
          <p className="text-muted-foreground">Erstelle und verwalte Produkt-Bundles</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Neues Bundle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editBundle ? 'Bundle bearbeiten' : 'Neues Bundle erstellen'}</DialogTitle>
              <DialogDescription>
                {editBundle ? 'Bearbeite das Bundle' : 'Erstelle ein neues Produkt-Bundle mit Rabatt'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Bundle-Name</Label>
                <Input 
                  placeholder="z.B. Sparset 3x 50ml" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Beschreibung</Label>
                <Textarea 
                  placeholder="Bundle-Beschreibung..." 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Gesamtpreis (€)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="49.99" 
                    value={formData.total_price || ''}
                    onChange={(e) => setFormData({ ...formData, total_price: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rabatt (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="15" 
                    value={formData.discount_percentage || ''}
                    onChange={(e) => setFormData({ ...formData, discount_percentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anzahl Produkte</Label>
                <Input 
                  type="number" 
                  placeholder="3" 
                  value={formData.quantity_required}
                  onChange={(e) => setFormData({ ...formData, quantity_required: parseInt(e.target.value) || 3 })}
                />
              </div>
              <Button className="w-full" onClick={handleSaveBundle}>
                {editBundle ? 'Bundle speichern' : 'Bundle erstellen'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Bundles</p>
              <p className="text-2xl font-bold">
                {bundles.filter((b) => b.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø Rabatt</p>
              <p className="text-2xl font-bold">
                {bundles.length > 0
                  ? (
                      bundles.reduce((sum, b) => sum + b.discount_percentage, 0) /
                      bundles.length
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Bundles</p>
              <p className="text-2xl font-bold">{bundles.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bundle Name</TableHead>
              <TableHead>Beschreibung</TableHead>
              <TableHead>Anzahl</TableHead>
              <TableHead>Preis</TableHead>
              <TableHead>Rabatt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bundles.map((bundle) => (
              <TableRow key={bundle.id}>
                <TableCell className="font-medium">{bundle.name}</TableCell>
                <TableCell className="max-w-xs truncate">{bundle.description}</TableCell>
                <TableCell>
                  <Badge variant="outline">{bundle.quantity_required}x</Badge>
                </TableCell>
                <TableCell>€{bundle.total_price.toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">-{bundle.discount_percentage}%</Badge>
                </TableCell>
                <TableCell>
                  {bundle.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                  ) : (
                    <Badge variant="secondary">Inaktiv</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleBundleStatus(bundle.id, bundle.is_active)}
                    >
                      {bundle.is_active ? 'Deaktivieren' : 'Aktivieren'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleEditBundle(bundle)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteBundle(bundle.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
