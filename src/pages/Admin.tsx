import { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminLoadingSkeleton, TabContentLoader } from '@/components/LoadingStates';
import { getPerfumeNameById } from '@/lib/perfume-utils';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tag, 
  ShoppingCart, 
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
  MapPin,
  User,
  Mail,
  Gift,
  MessageSquare,
  Percent,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

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

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'Bestellungen', icon: ShoppingCart },
  { id: 'products', label: 'Produkte', icon: Package },
  { id: 'users', label: 'Kunden', icon: Users },
  { id: 'coupons', label: 'Rabattcodes', icon: Tag },
  { id: 'payback', label: 'Payback', icon: Percent },
  { id: 'partners', label: 'Partner', icon: UserCheck },
  { id: 'newsletter', label: 'Newsletter', icon: Mail },
  { id: 'contest', label: 'Gewinnspiel', icon: Gift },
];

export default function Admin() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
    } finally {
      setLoading(false);
    }
  }, []);

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
        description: "Bestellstatus aktualisiert",
      });
    } catch (error) {
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
        description: "Bestellung geloscht",
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Bestellung konnte nicht geloscht werden",
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
        description: `${selectedOrderIds.length} Bestellung(en) geloscht`,
      });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Bestellungen konnten nicht geloscht werden",
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

  const getStatusBadge = useCallback((status: string) => {
    const config: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      pending: { variant: 'secondary', label: 'Ausstehend' },
      pending_payment: { variant: 'outline', label: 'Zahlung offen' },
      processing: { variant: 'default', label: 'In Bearbeitung' },
      paid: { variant: 'default', label: 'Bezahlt' },
      shipped: { variant: 'outline', label: 'Versendet' },
      delivered: { variant: 'secondary', label: 'Zugestellt' },
      cancelled: { variant: 'destructive', label: 'Storniert' },
    };
    const { variant, label } = config[status] || { variant: 'secondary' as const, label: status };
    return <Badge variant={variant}>{label}</Badge>;
  }, []);

  if (loading) {
    return <AdminLoadingSkeleton />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-muted-foreground mb-4">Bitte melden Sie sich an</p>
            <Button asChild>
              <Link to="/">Zur Startseite</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <AdminAnalytics />
          </Suspense>
        );
      case 'products':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <ProductManagement />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <UserManagement />
          </Suspense>
        );
      case 'coupons':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <CouponManagement />
          </Suspense>
        );
      case 'payback':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <PaybackManagement />
          </Suspense>
        );
      case 'partners':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <PartnerManagement />
          </Suspense>
        );
      case 'newsletter':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <NewsletterManagement />
          </Suspense>
        );
      case 'contest':
        return (
          <Suspense fallback={<TabContentLoader />}>
            <ContestManagement />
          </Suspense>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Bestellungen</h2>
                <p className="text-muted-foreground">{orders.length} Bestellungen insgesamt</p>
              </div>
              {selectedOrderIds.length > 0 && (
                <Button variant="destructive" onClick={bulkDeleteOrders}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {selectedOrderIds.length} loschen
                </Button>
              )}
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="flex items-center gap-3 p-4 border-b bg-muted/50">
                  <Checkbox 
                    checked={selectedOrderIds.length === orders.length && orders.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                  <span className="text-sm font-medium">Alle auswahlen</span>
                </div>
                
                <div className="divide-y">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <Checkbox 
                          checked={selectedOrderIds.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                          <div>
                            <p className="font-mono font-semibold text-sm">
                              #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm truncate">{order.customerName || 'Gast'}</p>
                            <p className="text-xs text-muted-foreground truncate">{order.customerEmail}</p>
                          </div>
                          <div className="font-semibold">
                            EUR {order.totalAmount.toFixed(2)}
                          </div>
                          <div>
                            <Select 
                              value={order.status} 
                              onValueChange={(value) => updateOrderStatus(order.id, value)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Ausstehend</SelectItem>
                                <SelectItem value="pending_payment">Zahlung offen</SelectItem>
                                <SelectItem value="processing">In Bearbeitung</SelectItem>
                                <SelectItem value="paid">Bezahlt</SelectItem>
                                <SelectItem value="shipped">Versendet</SelectItem>
                                <SelectItem value="delivered">Zugestellt</SelectItem>
                                <SelectItem value="cancelled">Storniert</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="icon" variant="ghost" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Bestellung #{order.orderNumber || order.id.slice(-8).toUpperCase()}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-6 py-4">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Kunde
                                      </h4>
                                      <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                                        <p>{order.customerName || 'N/A'}</p>
                                        <p className="text-muted-foreground">{order.customerEmail}</p>
                                        <p className="text-muted-foreground">{order.customerPhone}</p>
                                      </div>
                                    </div>
                                    {order.shippingAddressData && (
                                      <div>
                                        <h4 className="font-medium mb-2 flex items-center gap-2">
                                          <MapPin className="w-4 h-4" /> Lieferadresse
                                        </h4>
                                        <div className="bg-muted p-3 rounded-lg text-sm space-y-1">
                                          <p>{order.shippingAddressData.firstName} {order.shippingAddressData.lastName}</p>
                                          <p>{order.shippingAddressData.street}</p>
                                          <p>{order.shippingAddressData.postalCode} {order.shippingAddressData.city}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium mb-2 flex items-center gap-2">
                                        <Package className="w-4 h-4" /> Bestelldetails
                                      </h4>
                                      <div className="bg-muted p-3 rounded-lg text-sm space-y-2">
                                        <div className="flex justify-between">
                                          <span>Status</span>
                                          {getStatusBadge(order.status)}
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Summe</span>
                                          <span className="font-semibold">EUR {order.totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Datum</span>
                                          <span>{new Date(order.createdAt).toLocaleDateString('de-DE')}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {order.orderItems && order.orderItems.length > 0 && (
                                      <div>
                                        <h4 className="font-medium mb-2">Artikel</h4>
                                        <div className="border rounded-lg divide-y">
                                          {order.orderItems.map((item) => (
                                            <div key={item.id} className="p-3 flex justify-between text-sm">
                                              <span>{item.quantity}x {getPerfumeNameById(item.perfumeId, item.variantId)}</span>
                                              <span className="font-medium">EUR {item.totalPrice.toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button size="icon" variant="ghost" onClick={() => deleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Keine Bestellungen vorhanden</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen dark bg-slate-950 text-slate-100" style={{ colorScheme: 'dark' }}>
      <div className="flex">
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} min-h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col`}>
          <div className="p-4 border-b border-slate-800">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <div>
                  <h1 className="font-bold text-lg text-white">ALDENAIR</h1>
                  <p className="text-xs text-slate-400">Admin Panel</p>
                </div>
              )}
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-slate-400 hover:text-white hover:bg-slate-800"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <nav className="flex-1 p-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                data-testid={`nav-${item.id}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className="p-2 border-t border-slate-800 space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-5 h-5" />
              {!sidebarCollapsed && <span>Zur Website</span>}
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>Abmelden</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 min-h-screen">
          <header className="bg-slate-900/50 border-b border-slate-800 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">
                  {menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-400">
                  Willkommen zuruck, {user.fullName || user.email?.split('@')[0]}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
                  Online
                </Badge>
              </div>
            </div>
          </header>

          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
