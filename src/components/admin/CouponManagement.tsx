import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus, Tag, Percent, Euro } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: string;
  minOrderAmount: string;
  maxUses: number | null;
  currentUses: number;
  expiresAt: string | null;
  isActive: boolean;
}

export default function CouponManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '0',
    minOrderAmount: '0',
    maxUses: '',
    expiresAt: '',
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCoupons(data);
      }
    } catch (error) {
      console.error('Error loading coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '0',
      minOrderAmount: '0',
      maxUses: '',
      expiresAt: '',
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      code: formData.code.toUpperCase(),
      discountType: formData.discountType,
      discountValue: formData.discountValue,
      minOrderAmount: formData.minOrderAmount,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      expiresAt: formData.expiresAt || null,
    };

    try {
      if (editingCoupon) {
        const response = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          toast({ title: "Erfolg", description: "Rabattcode aktualisiert" });
          loadCoupons();
        }
      } else {
        const response = await fetch('/api/admin/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        if (response.ok) {
          toast({ title: "Erfolg", description: "Rabattcode erstellt" });
          loadCoupons();
        }
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Aktion fehlgeschlagen", variant: "destructive" });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType || 'percentage',
      discountValue: coupon.discountValue || '0',
      minOrderAmount: coupon.minOrderAmount || '0',
      maxUses: coupon.maxUses?.toString() || '',
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Rabattcode wirklich löschen?')) return;
    
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (response.ok) {
        toast({ title: "Erfolg", description: "Rabattcode gelöscht" });
        loadCoupons();
      }
    } catch (error) {
      toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (response.ok) {
        loadCoupons();
      }
    } catch (error) {
      console.error('Toggle failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Tag className="h-6 w-6" />
          <h2 className="text-2xl font-bold">Rabattcodes</h2>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} data-testid="button-add-coupon">
              <Plus className="w-4 h-4 mr-2" />
              Neuer Rabattcode
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingCoupon ? 'Rabattcode bearbeiten' : 'Neuer Rabattcode'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Code</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="z.B. SOMMER20"
                  required
                  data-testid="input-coupon-code"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rabattart</Label>
                  <Select
                    value={formData.discountType}
                    onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger data-testid="select-discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Prozent</SelectItem>
                      <SelectItem value="fixed">Fester Betrag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rabattwert</Label>
                  <Input
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    min="0"
                    required
                    data-testid="input-discount-value"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mindestbestellwert</Label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    min="0"
                    data-testid="input-min-order"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Max. Nutzungen</Label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    placeholder="Unbegrenzt"
                    data-testid="input-max-uses"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Gültig bis</Label>
                <Input
                  type="date"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  data-testid="input-valid-until"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="button-save-coupon">
                {editingCoupon ? 'Speichern' : 'Erstellen'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Rabattcodes</CardTitle>
        </CardHeader>
        <CardContent>
          {coupons.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">Keine Rabattcodes vorhanden</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Rabatt</TableHead>
                  <TableHead>Mindestbestellwert</TableHead>
                  <TableHead>Nutzungen</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      {coupon.discountType === 'percentage' ? (
                        <span className="flex items-center gap-1">
                          <Percent className="w-4 h-4" />
                          {coupon.discountValue}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Euro className="w-4 h-4" />
                          {coupon.discountValue}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{parseFloat(coupon.minOrderAmount || '0').toFixed(2)} EUR</TableCell>
                    <TableCell>
                      {coupon.currentUses || 0} / {coupon.maxUses || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={coupon.isActive ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActive(coupon.id, coupon.isActive)}
                        data-testid={`badge-status-${coupon.id}`}
                      >
                        {coupon.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(coupon)}
                          data-testid={`button-edit-${coupon.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon.id)}
                          data-testid={`button-delete-${coupon.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
