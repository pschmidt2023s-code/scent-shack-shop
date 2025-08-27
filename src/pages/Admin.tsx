
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Users, CreditCard, Plus, Edit2, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';

interface Order {
  id: string;
  user_id: string | null;
  stripe_session_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
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

interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount?: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  active: boolean;
  created_at: string;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: 0,
    min_order_amount: 0,
    max_uses: null as number | null,
    valid_until: '',
    active: true,
  });

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    console.log('Checking admin status for user:', user.id);

    try {
      // Check if user has admin role
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      console.log('Admin query result:', { data, error });

      if (error || !data) {
        console.log('User is not admin:', error?.message || 'No admin role found');
        setIsAdmin(false);
      } else {
        console.log('User is admin!');
        setIsAdmin(true);
        await loadOrders();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

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

  // Coupon-related functions temporarily disabled until database types are updated
  /*
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
        description: "Coupons konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const createCoupon = async () => {
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          ...newCoupon,
          code: newCoupon.code.toUpperCase(),
          valid_from: new Date().toISOString(),
          valid_until: newCoupon.valid_until ? new Date(newCoupon.valid_until).toISOString() : null,
        });

      if (error) throw error;

      setNewCoupon({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_uses: null,
        valid_until: '',
        active: true,
      });

      await loadCoupons();
      toast({
        title: "Erfolg",
        description: "Coupon wurde erstellt",
      });
    } catch (error) {
      console.error('Error creating coupon:', error);
      toast({
        title: "Fehler",
        description: "Coupon konnte nicht erstellt werden",
        variant: "destructive",
      });
    }
  };

  const toggleCouponStatus = async (couponId: string, active: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active, updated_at: new Date().toISOString() })
        .eq('id', couponId);

      if (error) throw error;

      await loadCoupons();
      toast({
        title: "Erfolg",
        description: `Coupon wurde ${active ? 'aktiviert' : 'deaktiviert'}`,
      });
    } catch (error) {
      console.error('Error updating coupon:', error);
      toast({
        title: "Fehler",
        description: "Coupon-Status konnte nicht geändert werden",
        variant: "destructive",
      });
    }
  };
  */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user || isAdmin === false) {
    return <Navigate to="/" replace />;
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
                          <p className="font-semibold">#{order.id.slice(-8).toUpperCase()}</p>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Coupon-Verwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Die Coupon-Verwaltung ist derzeit nicht verfügbar.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bitte warten Sie, bis die Datenbanktypen aktualisiert wurden.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Benutzerverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Benutzerverwaltung wird in einer zukünftigen Version verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
