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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Package, MapPin, CreditCard, Truck, Mail } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface OrderDetailsModalProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderUpdated?: () => void;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  shippingAddressData: any;
  paymentMethod: string;
  paymentStatus: string;
  trackingNumber: string | null;
  adminNotes: string | null;
  items?: Array<{
    id: string;
    perfumeId: string;
    variantId: string;
    quantity: number;
    price: number;
    productName?: string;
    variantName?: string;
  }>;
}

export function OrderDetailsModal({ orderId, open, onOpenChange, onOrderUpdated }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [sendShippingEmail, setSendShippingEmail] = useState(true);

  useEffect(() => {
    if (orderId && open) {
      fetchOrderDetails();
    }
  }, [orderId, open]);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      const data = await response.json();
      setOrder(data);
      setStatus(data.status || 'pending');
      setTrackingNumber(data.trackingNumber || '');
      setAdminNotes(data.adminNotes || '');
    } catch (error) {
      console.error('Error fetching order:', error);
      toast.error('Fehler beim Laden der Bestellung');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrder = async () => {
    if (!orderId || !order) return;

    try {
      setSaving(true);
      
      const previousStatus = order.status;
      const isNowShipped = status === 'shipped' && previousStatus !== 'shipped';
      
      const updateResult = await apiRequest(`/orders/${orderId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          trackingNumber: trackingNumber || undefined,
          adminNotes: adminNotes || undefined,
        }),
      });
      
      if (updateResult.error) {
        throw new Error(updateResult.error);
      }

      if (isNowShipped && sendShippingEmail && trackingNumber) {
        const emailResult = await apiRequest(`/admin/orders/${orderId}/send-email`, {
          method: 'POST',
          body: JSON.stringify({ emailType: 'shipping' }),
        });
        
        if (emailResult.error) {
          console.error('Email sending failed:', emailResult.error);
          toast.warning('Bestellung aktualisiert, aber E-Mail konnte nicht gesendet werden');
        } else {
          toast.success('Bestellung aktualisiert und Versandbenachrichtigung gesendet');
        }
      } else {
        toast.success('Bestellung aktualisiert');
      }

      onOrderUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setSaving(false);
    }
  };

  const handleSendShippingEmail = async () => {
    if (!orderId) return;
    
    try {
      setSaving(true);
      const result = await apiRequest(`/admin/orders/${orderId}/send-email`, {
        method: 'POST',
        body: JSON.stringify({ emailType: 'shipping' }),
      });
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      toast.success('Versandbenachrichtigung gesendet');
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Fehler beim Senden der E-Mail');
    } finally {
      setSaving(false);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'Keine Adresse angegeben';
    if (typeof address === 'string') return address;
    
    const parts = [
      address.name,
      address.street,
      `${address.postalCode || address.postal_code || ''} ${address.city || ''}`.trim(),
      address.country,
    ].filter(Boolean);
    
    return parts.join('\n');
  };

  if (!order && loading) {
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

  if (!order) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fehler</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">Bestellung konnte nicht geladen werden.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bestellung #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            Erstellt am {new Date(order.createdAt).toLocaleDateString('de-DE')} | {order.customerName} ({order.customerEmail})
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
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-muted rounded-md">
                  <div>
                    <p className="font-medium">{item.productName || `Produkt ${item.perfumeId}`}</p>
                    {item.variantName && (
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    )}
                    <p className="text-sm">Menge: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Number(item.price).toFixed(2)} EUR</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Addresses */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Lieferadresse</h3>
            </div>
            <div className="pl-7">
              <pre className="text-sm bg-muted p-3 rounded-md whitespace-pre-wrap">
                {formatAddress(order.shippingAddressData)}
              </pre>
            </div>
          </div>

          {/* Payment Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Zahlungsinformationen</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 pl-7">
              <div>
                <Label className="text-muted-foreground">Gesamtbetrag</Label>
                <p className="text-2xl font-bold">{Number(order.totalAmount).toFixed(2)} EUR</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Zahlungsmethode</Label>
                <p className="font-medium">
                  {order.paymentMethod === 'card' ? 'Kreditkarte' : 
                   order.paymentMethod === 'paypal' ? 'PayPal' : 
                   order.paymentMethod === 'bank_transfer' || order.paymentMethod === 'bank' ? 'Überweisung' : 
                   order.paymentMethod || 'N/A'}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Zahlungsstatus</Label>
                <p className="font-medium">
                  {order.paymentStatus === 'completed' || order.paymentStatus === 'paid' ? 'Bezahlt' :
                   order.paymentStatus === 'pending' ? 'Ausstehend' :
                   order.paymentStatus === 'refunded' ? 'Erstattet' :
                   order.paymentStatus || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Bestellstatus</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" data-testid="select-order-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Ausstehend</SelectItem>
                <SelectItem value="processing">In Bearbeitung</SelectItem>
                <SelectItem value="shipped">Versendet</SelectItem>
                <SelectItem value="completed">Abgeschlossen</SelectItem>
                <SelectItem value="cancelled">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tracking Number - always visible but highlighted when shipped */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-semibold">Versandinformationen</h3>
            </div>
            <div className="space-y-3 pl-7">
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Sendungsnummer (Tracking)</Label>
                <Input
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="z.B. 00340434161094015902"
                  data-testid="input-tracking-number"
                />
              </div>
              
              {status === 'shipped' && order.status !== 'shipped' && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                  <Switch
                    id="sendEmail"
                    checked={sendShippingEmail}
                    onCheckedChange={setSendShippingEmail}
                    data-testid="switch-send-shipping-email"
                  />
                  <Label htmlFor="sendEmail" className="flex items-center gap-2 cursor-pointer">
                    <Mail className="w-4 h-4" />
                    Versandbenachrichtigung automatisch senden
                  </Label>
                </div>
              )}
              
              {order.status === 'shipped' && trackingNumber && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSendShippingEmail}
                  disabled={saving}
                  data-testid="button-resend-shipping-email"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Versandbenachrichtigung erneut senden
                </Button>
              )}
            </div>
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
              data-testid="textarea-admin-notes"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
              Abbrechen
            </Button>
            <Button onClick={handleUpdateOrder} disabled={saving} data-testid="button-save-order">
              {saving ? 'Speichern...' : 'Änderungen speichern'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
