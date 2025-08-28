
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Calendar, Euro, ChevronRight, RotateCcw, Download, FileText } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
  order_number?: string;
  order_items: {
    perfume_id: string;
    variant_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
  }[];
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
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
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
    const statusLabels = {
      pending: 'Ausstehend',
      paid: 'Bezahlt',
      processing: 'In Bearbeitung',
      shipped: 'Versendet',
      delivered: 'Zugestellt',
      cancelled: 'Storniert'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'paid':
        return 'default';
      case 'processing':
        return 'default';
      case 'shipped':
        return 'default';
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
      const { error } = await supabase
        .from('returns')
        .insert({
          order_id: selectedOrder.id,
          user_id: user?.id,
          reason: returnReason.trim(),
          status: 'pending'
        });

      if (error) throw error;

      // Send return notification email
      try {
        await supabase.functions.invoke('send-return-notification', {
          body: { 
            returnId: null, // We don't have the return ID yet since we just inserted
            orderId: selectedOrder.id,
            reason: returnReason.trim(),
            type: 'customer_submission'
          }
        });
      } catch (emailError) {
        console.error('Error sending return notification email:', emailError);
        // Don't fail the return submission if email fails
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

  const downloadInvoice = async (orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('download-invoice', {
        body: { orderId }
      });

      if (error) throw error;

      if (data?.pdfUrl) {
        window.open(data.pdfUrl, '_blank');
      } else if (data?.pdfData) {
        // Create blob and download
        const blob = new Blob([data.pdfData], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `Rechnung_${orderId.slice(-8)}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast({
        title: "Rechnung herunterladen",
        description: "Die Rechnung wird heruntergeladen.",
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: "Fehler",
        description: "Die Rechnung konnte nicht heruntergeladen werden.",
        variant: "destructive",
      });
    }
  };

  const canReturnOrder = (order: Order) => {
    // Allow returns for paid, shipped, or delivered orders within 14 days
    const orderDate = new Date(order.created_at);
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
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Bestellung #{order.id.slice(-8)}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(order.created_at).toLocaleDateString('de-DE')}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="w-3 h-3" />
                      €{(order.total_amount / 100).toFixed(2)}
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
                <div>
                  <h4 className="font-medium mb-2">Artikel ({order.order_items.length})</h4>
                  <div className="space-y-1">
                    {order.order_items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.quantity}x Parfum ({item.variant_id})</span>
                        <span>€{(item.total_price / 100).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-medium">Gesamt</span>
                  <span className="font-bold">€{(order.total_amount / 100).toFixed(2)}</span>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => downloadInvoice(order.id)}
                  >
                    <FileText className="w-3 h-3 mr-1" />
                    Rechnung
                  </Button>
                  
                  {canReturnOrder(order) && (
                    <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => setSelectedOrder(order)}
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Rückgabe
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  )}
                  
                  <Button variant="outline" size="sm" className="flex-1">
                    <ChevronRight className="w-3 h-3 mr-1" />
                    Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      {/* Return Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rückgabe anmelden</DialogTitle>
            <DialogDescription>
              Bestellung #{selectedOrder?.id.slice(-8)} - €{selectedOrder ? (selectedOrder.total_amount / 100).toFixed(2) : '0.00'}
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
                <li>• Rückgabe innerhalb von 14 Tagen möglich</li>
                <li>• Parfüms müssen ungeöffnet und originalverpackt sein</li>
                <li>• Kostenlose Rückgabe mit unserem Retourenlabel</li>
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
    </div>
  );
}
