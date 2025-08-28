import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Users, CreditCard } from 'lucide-react';
import CouponManagement from '@/components/admin/CouponManagement';
import UserManagement from '@/components/admin/UserManagement';

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
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

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
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bestellungen
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Benutzer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bestellungen ({orders.length})</CardTitle>
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
                          <span className="font-semibold">€{(order.total_amount / 100).toFixed(2)}</span>
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
                            <SelectItem value="paid">Bezahlt</SelectItem>
                            <SelectItem value="shipped">Versendet</SelectItem>
                            <SelectItem value="delivered">Zugestellt</SelectItem>
                            <SelectItem value="cancelled">Storniert</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-sm font-medium mb-1">Artikel:</p>
                          {order.order_items.map((item) => (
                            <p key={item.id} className="text-sm text-muted-foreground">
                              {item.quantity}x {item.perfume_id} - {item.variant_id}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Keine Bestellungen gefunden.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <CouponManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}