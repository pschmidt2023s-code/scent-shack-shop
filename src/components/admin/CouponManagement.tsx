import { useState } from 'react';
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
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  currentUses: number;
  validUntil: string | null;
  isActive: boolean;
}

export default function CouponManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: '1',
      code: 'WELCOME10',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 50,
      maxUses: 100,
      currentUses: 23,
      validUntil: '2025-03-31',
      isActive: true,
    },
    {
      id: '2',
      code: 'NEUJAHR25',
      discountType: 'percentage',
      discountValue: 25,
      minOrderAmount: 100,
      maxUses: 50,
      currentUses: 12,
      validUntil: '2025-01-31',
      isActive: true,
    },
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 0,
    minOrderAmount: 0,
    maxUses: '',
    validUntil: '',
  });

  const resetForm = () => {
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: 0,
      minOrderAmount: 0,
      maxUses: '',
      validUntil: '',
    });
    setEditingCoupon(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCoupon) {
      setCoupons(prev => prev.map(c => 
        c.id === editingCoupon.id 
          ? { ...c, ...formData, maxUses: formData.maxUses ? parseInt(formData.maxUses) : null }
          : c
      ));
      toast({
        title: "Erfolg",
        description: "Rabattcode aktualisiert",
      });
    } else {
      const newCoupon: Coupon = {
        id: Date.now().toString(),
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: formData.discountValue,
        minOrderAmount: formData.minOrderAmount,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        currentUses: 0,
        validUntil: formData.validUntil || null,
        isActive: true,
      };
      setCoupons(prev => [...prev, newCoupon]);
      toast({
        title: "Erfolg",
        description: "Rabattcode erstellt",
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxUses: coupon.maxUses?.toString() || '',
      validUntil: coupon.validUntil || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Rabattcode wirklich löschen?')) return;
    setCoupons(prev => prev.filter(c => c.id !== id));
    toast({
      title: "Erfolg",
      description: "Rabattcode gelöscht",
    });
  };

  const toggleActive = (id: string) => {
    setCoupons(prev => prev.map(c => 
      c.id === id ? { ...c, isActive: !c.isActive } : c
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
                    onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger data-testid="select-discount-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Prozent</SelectItem>
                      <SelectItem value="fixed">Festbetrag</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Rabattwert</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      required
                      data-testid="input-discount-value"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {formData.discountType === 'percentage' ? '%' : 'EUR'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mindestbestellwert</Label>
                  <Input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) || 0 })}
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
                  value={formData.validUntil}
                  onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                  data-testid="input-valid-until"
                />
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" data-testid="button-save-coupon">
                  Speichern
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {coupons.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tag className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Keine Rabattcodes vorhanden</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Rabatt</TableHead>
                  <TableHead>Mindestbetrag</TableHead>
                  <TableHead>Nutzungen</TableHead>
                  <TableHead>Gültig bis</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow key={coupon.id} data-testid={`row-coupon-${coupon.id}`}>
                    <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {coupon.discountType === 'percentage' ? (
                          <><Percent className="w-3 h-3" /> {coupon.discountValue}%</>
                        ) : (
                          <><Euro className="w-3 h-3" /> {coupon.discountValue}</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>{coupon.minOrderAmount} EUR</TableCell>
                    <TableCell>
                      {coupon.currentUses} / {coupon.maxUses || 'unbegrenzt'}
                    </TableCell>
                    <TableCell>{coupon.validUntil || 'Kein Limit'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.isActive ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => toggleActive(coupon.id)}
                      >
                        {coupon.isActive ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(coupon)}
                        data-testid={`button-edit-coupon-${coupon.id}`}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(coupon.id)}
                        data-testid={`button-delete-coupon-${coupon.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
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
