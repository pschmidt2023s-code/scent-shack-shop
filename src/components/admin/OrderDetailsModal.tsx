import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Package, MapPin, CreditCard } from 'lucide-react';

interface OrderDetailsModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

interface OrderDetails {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  shipping_address: any;
  payment_method: string;
  payment_status: string;
  tracking_number: string;
  order_items: Array<{
    id: string;
    product_id: string;
    variant_id: string;
    quantity: number;
    price: number;
  }>;
}

export function OrderDetailsModal({ orderId, open, onOpenChange, onOrderUpdated }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    if (orderId && open) {
      fetchOrderDetails();
    }
  }, [orderId, open]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;

      if (data) {
        setOrder(data as OrderDetails);
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Fehler beim Laden der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Bestellung aktualisiert');
      onOrderUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setLoading(false);
    }
  };

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bestellung laden...</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestellung #{order.order_number}</DialogTitle>
          <DialogDescription>
            Erstellt am {new Date(order.created_at).toLocaleDateString('de-DE')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Bestellpositionen</h3>
            </div>
            <div className="space-y-2 pl-7">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Produkt ID: {item.product_id}</p>
                    <p className="text-sm text-muted-foreground">Variante: {item.variant_id}</p>
                    <p className="text-sm">Menge: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">€{Number(item.price).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          {order.shipping_address && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Lieferadresse</h3>
              </div>
              <div className="pl-7">
                <pre className="text-sm bg-muted p-3 rounded-lg">
                  {typeof order.shipping_address === 'object' 
                    ? JSON.stringify(order.shipping_address, null, 2) 
                    : order.shipping_address}
                </pre>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Zahlungsinformationen</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <Label className="text-muted-foreground">Gesamtbetrag</Label>
                <p className="text-2xl font-bold">€{Number(order.total_amount).toFixed(2)}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Zahlungsmethode</Label>
                <p className="font-medium">{order.payment_method || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Bestellstatus</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="processing">In Bearbeitung</SelectItem>
                <SelectItem value="shipped">Versendet</SelectItem>
                <SelectItem value="delivered">Zugestellt</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-2">
            <Label htmlFor="adminNotes">Admin Notizen (intern)</Label>
            <Textarea
              id="adminNotes"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Interne Notizen zur Bestellung..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleUpdateOrder} disabled={loading}>
              {loading ? 'Speichern...' : 'Änderungen speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
