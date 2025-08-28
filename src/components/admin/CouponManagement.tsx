import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Edit, Plus } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  current_uses: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  created_at: string;
}

export default function CouponManagement() {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: '',
    valid_until: ''
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error) {
      console.error('Error loading coupons:', error);
      toast({
        title: "Fehler",
        description: "Rabattcodes konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      discount_type: 'percentage',
      discount_value: 0,
      min_order_amount: 0,
      max_uses: '',
      valid_until: ''
    });
    setEditingCoupon(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        discount_type: formData.discount_type,
        discount_value: formData.discount_value,
        min_order_amount: formData.min_order_amount * 100, // Convert to cents
        max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
        valid_until: formData.valid_until || null,
        active: true
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from('coupons')
          .update(couponData)
          .eq('id', editingCoupon.id);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Rabattcode wurde aktualisiert",
        });
      } else {
        const { error } = await supabase
          .from('coupons')
          .insert([couponData]);
        
        if (error) throw error;
        
        toast({
          title: "Erfolg",
          description: "Rabattcode wurde erstellt",
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast({
        title: "Fehler",
        description: "Rabattcode konnte nicht gespeichert werden",
        variant: "destructive",
      });
    }
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Rabattcode löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: "Rabattcode wurde gelöscht",
      });
      
      loadCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
      toast({
        title: "Fehler",
        description: "Rabattcode konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  const toggleCouponStatus = async (id: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !active })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Erfolg",
        description: `Rabattcode wurde ${!active ? 'aktiviert' : 'deaktiviert'}`,
      });
      
      loadCoupons();
    } catch (error) {
      console.error('Error updating coupon status:', error);
      toast({
        title: "Fehler",
        description: "Status konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount / 100, // Convert from cents
      max_uses: coupon.max_uses?.toString() || '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rabattcodes werden geladen...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rabattcodes ({coupons.length})</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  Neuer Rabattcode
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon ? 'Rabattcode bearbeiten' : 'Neuer Rabattcode'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="code">Code</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="SAVE20"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="discount_type">Rabatt-Typ</Label>
                    <Select
                      value={formData.discount_type}
                      onValueChange={(value) => setFormData({...formData, discount_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Prozent</SelectItem>
                        <SelectItem value="fixed">Fester Betrag</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="discount_value">
                      Rabatt-Wert {formData.discount_type === 'percentage' ? '(%)' : '(€)'}
                    </Label>
                    <Input
                      id="discount_value"
                      type="number"
                      value={formData.discount_value}
                      onChange={(e) => setFormData({...formData, discount_value: parseInt(e.target.value)})}
                      min="0"
                      max={formData.discount_type === 'percentage' ? '100' : undefined}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="min_order_amount">Mindestbestellwert (€)</Label>
                    <Input
                      id="min_order_amount"
                      type="number"
                      value={formData.min_order_amount}
                      onChange={(e) => setFormData({...formData, min_order_amount: parseInt(e.target.value)})}
                      min="0"
                    />
                  </div>

                  <div>
                    <Label htmlFor="max_uses">Max. Verwendungen (optional)</Label>
                    <Input
                      id="max_uses"
                      type="number"
                      value={formData.max_uses}
                      onChange={(e) => setFormData({...formData, max_uses: e.target.value})}
                      min="1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="valid_until">Gültig bis (optional)</Label>
                    <Input
                      id="valid_until"
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    {editingCoupon ? 'Aktualisieren' : 'Erstellen'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">{coupon.code}</span>
                      <Badge variant={coupon.active ? 'default' : 'secondary'}>
                        {coupon.active ? 'Aktiv' : 'Inaktiv'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {coupon.discount_type === 'percentage' 
                        ? `${coupon.discount_value}% Rabatt`
                        : `€${coupon.discount_value} Rabatt`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleCouponStatus(coupon.id, coupon.active)}
                    >
                      {coupon.active ? 'Deaktivieren' : 'Aktivieren'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editCoupon(coupon)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteCoupon(coupon.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground space-y-1">
                  {coupon.min_order_amount > 0 && (
                    <p>Mindestbestellwert: €{(coupon.min_order_amount / 100).toFixed(2)}</p>
                  )}
                  {coupon.max_uses && (
                    <p>Verwendungen: {coupon.current_uses}/{coupon.max_uses}</p>
                  )}
                  {coupon.valid_until && (
                    <p>Gültig bis: {new Date(coupon.valid_until).toLocaleDateString('de-DE')}</p>
                  )}
                </div>
              </div>
            ))}
            
            {coupons.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Rabattcodes gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}