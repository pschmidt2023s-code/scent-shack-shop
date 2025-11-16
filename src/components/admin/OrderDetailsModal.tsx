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
import { Trash2, Package, User, MapPin, CreditCard } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

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
  currency: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  created_at: string;
  updated_at: string;
  notes: string;
  admin_notes: string;
  shipping_address_data: any;
  billing_address_data: any;
  order_items: Array<{
    id: string;
    perfume_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

export function OrderDetailsModal({ orderId, open, onOpenChange, onOrderUpdated }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

      setOrder(data);
      setStatus(data.status);
      setAdminNotes(data.admin_notes || '');
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
          admin_notes: adminNotes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success('Bestellung erfolgreich aktualisiert');
      onOrderUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Fehler beim Aktualisieren der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      // Then delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) throw orderError;

      toast.success('Bestellung erfolgreich gelöscht');
      onOrderUpdated?.();
      onOpenChange(false);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Fehler beim Löschen der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  if (!order && !loading) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Bestelldetails #{order?.order_number || orderId}</DialogTitle>
            <DialogDescription>
              Erstellt am {order ? new Date(order.created_at).toLocaleString('de-DE') : ''}
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="space-y-4 py-4">
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
              <div className="h-20 bg-muted animate-pulse rounded" />
            </div>
          ) : order ? (
            <div className="space-y-6 py-4">
              {/* Customer Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <h3 className="font-semibold">Kundeninformationen</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-7">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="font-medium">{order.customer_name || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">E-Mail</Label>
                    <p className="font-medium">{order.customer_email || 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Telefon</Label>
                    <p className="font-medium">{order.customer_phone || 'N/A'}</p>
                  </div>
                </div>
              </div>

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
                        <p className="font-medium">Produkt ID: {item.perfume_id}</p>
                        <p className="text-sm text-muted-foreground">Variante: {item.variant_id}</p>
                        <p className="text-sm">Menge: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{item.total_price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">€{item.unit_price.toFixed(2)} / Stück</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Addresses */}
              {(order.shipping_address_data || order.billing_address_data) && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-semibold">Adressen</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pl-7">
                    {order.shipping_address_data && (
                      <div>
                        <Label className="text-muted-foreground">Lieferadresse</Label>
                        <p className="text-sm mt-1">
                          {order.shipping_address_data.first_name} {order.shipping_address_data.last_name}<br />
                          {order.shipping_address_data.street}<br />
                          {order.shipping_address_data.postal_code} {order.shipping_address_data.city}<br />
                          {order.shipping_address_data.country}
                        </p>
                      </div>
                    )}
                    {order.billing_address_data && (
                      <div>
                        <Label className="text-muted-foreground">Rechnungsadresse</Label>
                        <p className="text-sm mt-1">
                          {order.billing_address_data.first_name} {order.billing_address_data.last_name}<br />
                          {order.billing_address_data.street}<br />
                          {order.billing_address_data.postal_code} {order.billing_address_data.city}<br />
                          {order.billing_address_data.country}
                        </p>
                      </div>
                    )}
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
                    <p className="text-2xl font-bold">€{order.total_amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Währung</Label>
                    <p className="font-medium">{order.currency?.toUpperCase() || 'EUR'}</p>
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

              {/* Customer Notes */}
              {order.notes && (
                <div className="space-y-2">
                  <Label>Kundennotizen</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{order.notes}</p>
                  </div>
                </div>
              )}

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

              {/* Actions */}
              <div className="flex gap-2 justify-between pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={loading}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Bestellung löschen
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Abbrechen
                  </Button>
                  <Button onClick={handleUpdateOrder} disabled={loading}>
                    Änderungen speichern
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bestellung wirklich löschen?</AlertDialogTitle>
            <AlertDialogDescription>
              Diese Aktion kann nicht rückgängig gemacht werden. Die Bestellung und alle zugehörigen Positionen werden permanent gelöscht.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteOrder} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Bestellung löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
