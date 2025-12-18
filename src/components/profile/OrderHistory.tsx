import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Calendar, Euro, ChevronRight, RotateCcw, FileText } from 'lucide-react';

interface OrderItem {
  perfumeId: string;
  variantId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: string;
  currency: string;
  createdAt: string;
  orderNumber?: string;
  items?: OrderItem[];
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Fehler",
        description: "Bestellungen konnten nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: Record<string, string> = {
      pending: 'Ausstehend',
      pending_payment: 'Zahlung ausstehend',
      paid: 'Bezahlt',
      processing: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Zugestellt',
      cancelled: 'Storniert'
    };
    return statusLabels[status] || status;
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'pending':
      case 'pending_payment':
        return 'secondary';
      case 'paid':
      case 'processing':
      case 'shipped':
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const submitReturn = async () => {
    if (!selectedOrder || !returnReason.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Rückgabegrund an.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingReturn(true);
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderId: selectedOrder.id,
          reason: returnReason.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit return');
      }

      toast({
        title: "Rückgabe angemeldet",
        description: "Ihre Rückgabe wurde erfolgreich angemeldet. Sie erhalten eine Bestätigung per E-Mail.",
      });

      setReturnDialogOpen(false);
      setReturnReason('');
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error submitting return:', error);
      toast({
        title: "Fehler",
        description: "Die Rückgabe konnte nicht angemeldet werden.",
        variant: "destructive",
      });
    } finally {
      setSubmittingReturn(false);
    }
  };

  const canReturnOrder = (order: Order) => {
    const orderDate = new Date(order.createdAt);
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const returnableStatuses = ['paid', 'shipped', 'delivered'];
    return returnableStatuses.includes(order.status) && orderDate > fourteenDaysAgo;
  };

  if (loading) {
    return <div className="text-center p-4">Lade Bestellungen...</div>;
  }

  return (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <div className="text-center p-8 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Noch keine Bestellungen</p>
          <p className="text-sm">Ihre Bestellhistorie wird hier angezeigt</p>
        </div>
      ) : (
        orders.map((order) => (
          <Card key={order.id} data-testid={`card-order-${order.id}`}>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-start gap-2">
                <div>
                  <CardTitle className="text-lg">
                    Bestellung #{order.orderNumber || order.id.slice(-8)}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.createdAt).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      {parseFloat(order.totalAmount).toFixed(2)} €
                    </div>
                  </div>
                </div>
                <Badge variant={getStatusVariant(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.items && order.items.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Artikel ({order.items.length})</h4>
                    <div className="space-y-1">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.quantity}x Parfum</span>
                          <span>{parseFloat(item.totalPrice).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Gesamt</span>
                  <span className="font-bold">{parseFloat(order.totalAmount).toFixed(2)} €</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    data-testid={`button-invoice-${order.id}`}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Rechnung
                  </Button>
                  
                  {canReturnOrder(order) && (
                    <Dialog open={returnDialogOpen && selectedOrder?.id === order.id} onOpenChange={(open) => {
                      setReturnDialogOpen(open);
                      if (open) setSelectedOrder(order);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          data-testid={`button-return-${order.id}`}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rückgabe
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Rückgabe anmelden</DialogTitle>
                          <DialogDescription>
                            Bestellung #{order.orderNumber || order.id.slice(-8)} - {parseFloat(order.totalAmount).toFixed(2)} €
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="return-reason">Grund für die Rückgabe *</Label>
                            <Textarea
                              id="return-reason"
                              placeholder="Bitte beschreiben Sie den Grund für Ihre Rückgabe..."
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="mt-1"
                              rows={4}
                            />
                          </div>
                          
                          <div className="bg-muted/50 p-3 rounded-lg text-sm">
                            <p className="font-medium mb-1">Rückgabebedingungen:</p>
                            <ul className="text-muted-foreground space-y-1">
                              <li>Rückgabe innerhalb von 14 Tagen möglich</li>
                              <li>Parfüms müssen ungeöffnet und originalverpackt sein</li>
                              <li>Kostenlose Rückgabe mit unserem Retourenlabel</li>
                            </ul>
                          </div>
                          
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setReturnDialogOpen(false);
                                setReturnReason('');
                                setSelectedOrder(null);
                              }}
                              className="flex-1"
                              disabled={submittingReturn}
                            >
                              Abbrechen
                            </Button>
                            <Button
                              onClick={submitReturn}
                              className="flex-1"
                              disabled={submittingReturn || !returnReason.trim()}
                            >
                              {submittingReturn ? 'Wird angemeldet...' : 'Rückgabe anmelden'}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`button-details-${order.id}`}>
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
