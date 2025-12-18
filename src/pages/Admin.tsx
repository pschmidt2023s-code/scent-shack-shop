import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, Users, CreditCard, Eye, MapPin, User, Trash2, CheckSquare, Square } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLoadingSkeleton, SmoothLoader, TabContentLoader } from '@/components/LoadingStates';

// Lazy load admin components for better performance
const CouponManagement = lazy(() => import('@/components/admin/CouponManagement'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const ReturnManagement = lazy(() => import('@/components/admin/ReturnManagement'));
const PartnerManagement = lazy(() => import('@/components/admin/PartnerManagement'));
const NewsletterManagement = lazy(() => import('@/components/admin/NewsletterManagement'));
const PaybackManagement = lazy(() => import('@/components/admin/PaybackManagement'));
const AdminChatInterface = lazy(() => import('@/components/admin/AdminChatInterface'));
const ContestManagement = lazy(() => import('@/components/admin/ContestManagement').then(module => ({ default: module.ContestManagement })));
const ProductManagement = lazy(() => import('@/components/admin/ProductManagement'));
const AdminAnalytics = lazy(() => import('@/components/admin/AdminAnalytics'));
import { getPerfumeNameById } from '@/lib/perfume-utils';

interface Order {
  id: string;
  userId: string | null;
  stripeSessionId: string;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddressData?: any;
  billingAddressData?: any;
  orderItems?: OrderItem[];
}

interface OrderItem {
  id: string;
  perfumeId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include',
      });
      
      if (!response.ok) throw new Error('Failed to load orders');
      
      const data = await response.json();
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
  }, [toast]);

  const updateOrderStatus = useCallback(async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update order status');

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
  }, [loadOrders, toast]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete order');

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
  }, [loadOrders, toast]);

  const bulkDeleteOrders = useCallback(async () => {
    if (selectedOrderIds.length === 0) return;
    
    try {
      for (const orderId of selectedOrderIds) {
        await fetch(`/api/orders/${orderId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      }

      setSelectedOrderIds([]);
      await loadOrders();
      toast({
        title: "Erfolg",
        description: `${selectedOrderIds.length} Bestellung(en) erfolgreich gelöscht`,
      });
    } catch (error) {
      console.error('Error bulk deleting orders:', error);
      toast({
        title: "Fehler",
        description: "Bestellungen konnten nicht gelöscht werden",
        variant: "destructive",
      });
    }
  }, [selectedOrderIds, loadOrders, toast]);

  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map(order => order.id));
    }
  }, [orders, selectedOrderIds.length]);

  // Memoized components for performance
  const memoizedOrders = useMemo(() => orders, [orders]);
  
  const getStatusBadge = useCallback((status: string) => {
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
  }, []);

  if (loading) {
    return <AdminLoadingSkeleton />;
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


  return (
    <div className="min-h-screen glass animate-fade-in-up">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-slide-in-left">
          <h1 className="text-3xl font-bold mb-2 text-gradient-luxury">Admin Dashboard</h1>
          <p className="text-muted-foreground">Verwalten Sie Bestellungen, Coupons und mehr</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-6 lg:grid-cols-11 w-full max-w-6xl backdrop-blur-sm bg-card/80 border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Bestellungen
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Produkte
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Kunden
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Coupons
            </TabsTrigger>
            <TabsTrigger value="payback" className="flex items-center gap-2">
              Payback
            </TabsTrigger>
            <TabsTrigger value="partners" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Users className="w-4 h-4 transition-transform duration-200" />
              Partner
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Users className="w-4 h-4 transition-transform duration-200" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="contest" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Package className="w-4 h-4 transition-transform duration-200" />
              Gewinnspiel
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Users className="w-4 h-4 transition-transform duration-200" />
              Benutzer
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-2 transition-all duration-300 hover:scale-105">
              <Package className="w-4 h-4 transition-transform duration-200" />
              Produkte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Suspense fallback={<TabContentLoader />}>
              <AdminAnalytics />
            </Suspense>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Suspense fallback={<TabContentLoader />}>
              <ProductManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Suspense fallback={<TabContentLoader />}>
              <AdminChatInterface />
            </Suspense>
          </TabsContent>

          <TabsContent value="payback" className="space-y-6">
            <Suspense fallback={<TabContentLoader />}>
              <PaybackManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card className="backdrop-blur-sm bg-card/90 border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Aufgegebene Bestellungen ({memoizedOrders.length})
                  </div>
                  {selectedOrderIds.length > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={bulkDeleteOrders}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {selectedOrderIds.length} Bestellung(en) löschen
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4 p-2 bg-muted rounded-lg">
                  <Checkbox 
                    checked={selectedOrderIds.length === orders.length && orders.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">Alle auswählen</span>
                </div>
                <div className="space-y-4">
                  {memoizedOrders.map((order, index) => (
                    <div key={order.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Checkbox 
                            checked={selectedOrderIds.includes(order.id)}
                            onCheckedChange={() => toggleOrderSelection(order.id)}
                          />
                          <div>
                            <p className="font-semibold">#{order.orderNumber || order.id.slice(-8).toUpperCase()}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">€{order.totalAmount.toFixed(2)}</span>
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
                              <DialogTitle>Bestelldetails - #{order.orderNumber || order.id.slice(-8).toUpperCase()}</DialogTitle>
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
                                    {order.customerName && (
                                      <p className="text-sm"><strong>Name:</strong> {order.customerName}</p>
                                    )}
                                    {order.customerEmail && (
                                      <p className="text-sm"><strong>E-Mail:</strong> {order.customerEmail}</p>
                                    )}
                                    {order.customerPhone && (
                                      <p className="text-sm"><strong>Telefon:</strong> {order.customerPhone}</p>
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
                                    <p className="text-sm"><strong>Betrag:</strong> €{order.totalAmount.toFixed(2)}</p>
                                    <p className="text-sm"><strong>Datum:</strong> {new Date(order.createdAt).toLocaleDateString('de-DE')}</p>
                                  </div>
                                </div>
                              </div>

                              {/* Shipping Address */}
                              {order.shippingAddressData && (
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <h3 className="font-medium">Lieferadresse</h3>
                                  </div>
                                  <div className="bg-muted p-3 rounded-lg">
                                    <div className="text-sm space-y-1">
                                      <p>{order.shippingAddressData.firstName} {order.shippingAddressData.lastName}</p>
                                      <p>{order.shippingAddressData.street}</p>
                                      <p>{order.shippingAddressData.postalCode} {order.shippingAddressData.city}</p>
                                      <p>{order.shippingAddressData.country}</p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Order Items */}
                              {order.orderItems && order.orderItems.length > 0 && (
                                <div className="space-y-3">
                                  <h3 className="font-medium">Bestellte Artikel</h3>
                                  <div className="border rounded-lg divide-y">
                                    {order.orderItems.map((item) => (
                                      <div key={item.id} className="p-3 flex justify-between items-center">
                                       <div>
                                           <p className="font-medium text-sm">
                                             {item.quantity}x {getPerfumeNameById(item.perfumeId, item.variantId)}
                                           </p>
                                           <p className="text-xs text-muted-foreground">
                                             Einzelpreis: €{item.unitPrice.toFixed(2)}
                                           </p>
                                         </div>
                                        <div className="text-right">
                                          <p className="font-medium">€{item.totalPrice.toFixed(2)}</p>
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
                  
                  {memoizedOrders.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Keine aufgegebenen Bestellungen gefunden.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="returns" className="space-y-6 animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <ReturnManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="coupons" className="space-y-6 animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <CouponManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="partners" className="space-y-6 animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <PartnerManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="newsletter" className="space-y-6 animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <NewsletterManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="contest" className="space-y-6 animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <ContestManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="users" className="animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <UserManagement />
            </Suspense>
          </TabsContent>

          <TabsContent value="products" className="animate-fade-in duration-500">
            <Suspense fallback={<TabContentLoader />}>
              <ProductManagement />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}