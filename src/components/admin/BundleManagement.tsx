import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Package, TrendingUp } from 'lucide-react';
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
  totalPrice: number;
  discountPercentage: number;
  isActive: boolean;
  quantityRequired: number;
}

export function BundleManagement() {
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editBundle, setEditBundle] = useState<Bundle | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    totalPrice: 0,
    discountPercentage: 0,
    quantityRequired: 3
  });

  useEffect(() => {
    fetchBundles();
  }, []);

  const fetchBundles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/bundles', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setBundles(data || []);
      } else {
        setBundles([]);
      }
    } catch (error) {
      console.error('Error fetching bundles:', error);
      toast.error('Fehler beim Laden der Bundles');
    } finally {
      setLoading(false);
    }
  };

  const toggleBundleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/bundles/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (!response.ok) throw new Error('Failed to update');
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
      const response = await fetch(`/api/admin/bundles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Bundle gelöscht');
      fetchBundles();
    } catch (error) {
      console.error('Error deleting bundle:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const handleSaveBundle = async () => {
    try {
      if (!formData.name || !formData.totalPrice || formData.discountPercentage === undefined) {
        toast.error('Bitte fülle alle Pflichtfelder aus');
        return;
      }

      const url = editBundle ? `/api/admin/bundles/${editBundle.id}` : '/api/admin/bundles';
      const method = editBundle ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          totalPrice: formData.totalPrice,
          discountPercentage: formData.discountPercentage,
          quantityRequired: formData.quantityRequired,
          isActive: true,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');
      
      toast.success(editBundle ? 'Bundle aktualisiert' : 'Bundle erstellt');
      setCreateOpen(false);
      setEditBundle(null);
      setFormData({ name: '', description: '', totalPrice: 0, discountPercentage: 0, quantityRequired: 3 });
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
      totalPrice: bundle.totalPrice,
      discountPercentage: bundle.discountPercentage,
      quantityRequired: bundle.quantityRequired || 3
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
            <Button className="gap-2" data-testid="button-new-bundle">
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
                  <Label>Gesamtpreis (EUR)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="49.99" 
                    value={formData.totalPrice || ''}
                    onChange={(e) => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rabatt (%)</Label>
                  <Input 
                    type="number" 
                    placeholder="15" 
                    value={formData.discountPercentage || ''}
                    onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anzahl Produkte</Label>
                <Input 
                  type="number" 
                  placeholder="3" 
                  value={formData.quantityRequired}
                  onChange={(e) => setFormData({ ...formData, quantityRequired: parseInt(e.target.value) || 3 })}
                />
              </div>
              <Button className="w-full" onClick={handleSaveBundle} data-testid="button-save-bundle">
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
                {bundles.filter((b) => b.isActive).length}
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
              <p className="text-sm text-muted-foreground">durchschnittlicher Rabatt</p>
              <p className="text-2xl font-bold">
                {bundles.length > 0
                  ? (
                      bundles.reduce((sum, b) => sum + b.discountPercentage, 0) /
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
            {bundles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Keine Bundles vorhanden
                </TableCell>
              </TableRow>
            ) : (
              bundles.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="font-medium">{bundle.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{bundle.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{bundle.quantityRequired}x</Badge>
                  </TableCell>
                  <TableCell>EUR{bundle.totalPrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">-{bundle.discountPercentage}%</Badge>
                  </TableCell>
                  <TableCell>
                    {bundle.isActive ? (
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
                        onClick={() => toggleBundleStatus(bundle.id, bundle.isActive)}
                      >
                        {bundle.isActive ? 'Deaktivieren' : 'Aktivieren'}
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
