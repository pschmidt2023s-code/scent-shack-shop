import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Users, CreditCard, Eye, MapPin, User, Trash2 } from 'lucide-react';
import CouponManagement from '@/components/admin/CouponManagement';
import UserManagement from '@/components/admin/UserManagement';
import ReturnManagement from '@/components/admin/ReturnManagement';
import PartnerManagement from '@/components/admin/PartnerManagement';
import NewsletterManagement from '@/components/admin/NewsletterManagement';
import { getPerfumeNameById } from '@/lib/perfume-utils';

interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  order_number?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  shipping_address_data?: any;
  billing_address_data?: any;
  order_items?: OrderItem[];
}

interface OrderItem {
  id: string;
  perfume_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export default function Admin() {
  console.log('ADMIN COMPONENT LOADING - FULL VERSION');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .not('order_number', 'is', null) // Only show orders with order numbers (completed orders)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Fehler",
        description: "Bestellungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      // Get current order data for email notification
      const { data: orderData } = await supabase
        .from('orders')
        .select('status, customer_email, customer_name, order_number')
        .eq('id', orderId)
        .single();

      const oldStatus = orderData?.status;

      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      // Send status update email if customer email exists and status actually changed
      if (orderData?.customer_email && oldStatus !== newStatus) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-order-status-update', {
            body: {
              orderId: orderId,
              newStatus: newStatus,
              oldStatus: oldStatus
            }
          });

          if (emailError) {
            console.error('Error sending order status update email:', emailError);
          } else {
            console.log('Order status update email sent successfully');
          }
        } catch (emailError) {
          console.error('Failed to send order status update email:', emailError);
        }
      }

      await loadOrders();
      toast({
        title: "Erfolg",
        description: "Bestellstatus wurde aktualisiert",
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Fehler",
        description: "Bestellstatus konnte nicht aktualisiert werden",
        variant: "destructive",
      });
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Bestellung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      await loadOrders();
      toast({
        title: "Erfolg",
        description: "Bestellung wurde erfolgreich gelöscht",
      });
    } catch (error) {
      console.error('Error deleting order:', error);
      toast({
        title: "Fehler",
        description: "Bestellung konnte nicht gelöscht werden",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h2>
          <p className="text-muted-foreground">Bitte melden Sie sich an, um auf das Admin-Dashboard zuzugreifen.</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants = {
       pending: 'secondary',
       pending_payment: 'outline',
       processing: 'default',
       paid: 'default',
       shipped: 'outline',
       delivered: 'secondary',
       cancelled: 'destructive',
     } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Verwalten Sie Bestellungen, Coupons und mehr</p>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-4xl">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bestellungen
            </TabsTrigger>
            <TabsTrigger value="returns" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Retouren
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Partner
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Benutzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Aufgegebene Bestellungen ({orders.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">#{order.order_number || order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">€{order.total_amount.toFixed(2)}</span>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Ausstehend</SelectItem>
                            <SelectItem value="pending_payment">Zahlung ausstehend</SelectItem>
                            <SelectItem value="processing">In Bearbeitung</SelectItem>
                            <SelectItem value="paid">Bezahlt</SelectItem>
                            <SelectItem value="shipped">Versendet</SelectItem>
                            <SelectItem value="delivered">Zugestellt</SelectItem>
                            <SelectItem value="cancelled">Storniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Details anzeigen
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Bestelldetails - #{order.order_number || order.id.slice(-8).toUpperCase()}</DialogTitle>
                            </DialogHeader>
                            
                            <div className="space-y-6">
                              {/* Customer Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <h3 className="font-medium">Kundeninformationen</h3>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg space-y-2">
                                    {order.customer_name && (
                                      <p className="text-sm"><strong>Name:</strong> {order.customer_name}</p>
                                    )}
                                    {order.customer_email && (
                                      <p className="text-sm"><strong>E-Mail:</strong> {order.customer_email}</p>
                                    )}
                                    {order.customer_phone && (
                                      <p className="text-sm"><strong>Telefon:</strong> {order.customer_phone}</p>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4" />
                                    <h3 className="font-medium">Bestellinformationen</h3>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg space-y-2">
                                    <p className="text-sm"><strong>Status:</strong> {getStatusBadge(order.status)}</p>
                                    <p className="text-sm"><strong>Betrag:</strong> €{order.total_amount.toFixed(2)}</p>
                                    <p className="text-sm"><strong>Datum:</strong> {new Date(order.created_at).toLocaleDateString('de-DE')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              {order.shipping_address_data && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <h3 className="font-medium">Lieferadresse</h3>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg">
                                    <div className="text-sm space-y-1">
                                      <p>{order.shipping_address_data.firstName} {order.shipping_address_data.lastName}</p>
                                      <p>{order.shipping_address_data.street}</p>
                                      <p>{order.shipping_address_data.postalCode} {order.shipping_address_data.city}</p>
                                      <p>{order.shipping_address_data.country}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              {order.order_items && order.order_items.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="font-medium">Bestellte Artikel</h3>
                                  <div className="border rounded-lg divide-y">
                                    {order.order_items.map((item) => (
                                      <div key={item.id} className="p-3 flex justify-between items-center">
                                       <div>
                                           <p className="font-medium text-sm">
                                             {item.quantity}x {getPerfumeNameById(item.perfume_id, item.variant_id)}
                                           </p>
                                           <p className="text-xs text-muted-foreground">
                                             Einzelpreis: €{item.unit_price.toFixed(2)}
                                           </p>
                                         </div>
                                        <div className="text-right">
                                          <p className="font-medium">€{item.total_price.toFixed(2)}</p>
                                          <p className="text-xs text-muted-foreground">{item.quantity}x</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteOrder(order.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Löschen
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Keine aufgegebenen Bestellungen gefunden.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="space-y-6">
            <ReturnManagement />
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="partners" className="space-y-6">
            <PartnerManagement />
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-6">
            <NewsletterManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}