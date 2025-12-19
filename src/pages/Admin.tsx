import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { getPerfumeNameById } from '@/lib/perfume-utils';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tag, 
  ShoppingCart, 
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
  Percent,
  UserCheck,
  Menu,
  X,
  Home,
  Loader2
} from 'lucide-react';

const CouponManagement = lazy(() => import('@/components/admin/CouponManagement'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const PartnerManagement = lazy(() => import('@/components/admin/PartnerManagement'));
const NewsletterManagement = lazy(() => import('@/components/admin/NewsletterManagement'));
const PaybackManagement = lazy(() => import('@/components/admin/PaybackManagement'));
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

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        description: "Bestellung gelöscht",
      });
    } catch (error) {
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
        description: `${selectedOrderIds.length} Bestellung(en) gelöscht`,
      });
    } catch (error) {
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Lade Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
            <p className="text-muted-foreground mb-6">
              Bitte melden Sie sich an, um auf das Admin Dashboard zuzugreifen.
            </p>
            <Button asChild className="w-full">
              <Link to="/">Zur Startseite</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not Admin
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
            <p className="text-muted-foreground mb-6">
              Sie haben keine Berechtigung für das Admin Dashboard.
            </p>
            <Button asChild className="w-full">
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
          <Suspense fallback={<LoadingSpinner />}>
            <AdminAnalytics />
          </Suspense>
        );
      case 'products':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductManagement />
          </Suspense>
        );
      case 'users':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <UserManagement />
          </Suspense>
        );
      case 'coupons':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <CouponManagement />
          </Suspense>
        );
      case 'payback':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PaybackManagement />
          </Suspense>
        );
      case 'partners':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <PartnerManagement />
          </Suspense>
        );
      case 'newsletter':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <NewsletterManagement />
          </Suspense>
        );
      case 'contest':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <ContestManagement />
          </Suspense>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Bestellungen</h2>
                <p className="text-muted-foreground">{orders.length} Bestellungen insgesamt</p>
              </div>
              {selectedOrderIds.length > 0 && (
                <Button variant="destructive" onClick={bulkDeleteOrders}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  {selectedOrderIds.length} löschen
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
                  <span className="text-sm font-medium">Alle auswählen</span>
                </div>
                
                <div className="divide-y">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start gap-4">
                        <Checkbox 
                          checked={selectedOrderIds.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                          className="mt-1"
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
                                <Button size="icon" variant="ghost">
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    Bestellung #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
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
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => deleteOrder(order.id)}
                            >
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
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Seite nicht gefunden</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-0 z-50 
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:translate-x-0
          ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'} 
          w-64 h-screen bg-card border-r border-border transition-all duration-300 flex flex-col
        `}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {(!sidebarCollapsed || mobileMenuOpen) && (
                <div>
                  <h1 className="font-bold text-lg text-foreground">ALDENAIR</h1>
                  <p className="text-xs text-muted-foreground">Admin Panel</p>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="hidden lg:flex"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                  {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                data-testid={`nav-admin-${item.id}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(!sidebarCollapsed || mobileMenuOpen) && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-border space-y-1">
            <Link 
              to="/" 
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Home className="w-5 h-5" />
              {(!sidebarCollapsed || mobileMenuOpen) && <span>Zur Website</span>}
            </Link>
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {(!sidebarCollapsed || mobileMenuOpen) && <span>Abmelden</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-screen">
          {/* Header */}
          <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="lg:hidden"
                  onClick={() => setMobileMenuOpen(true)}
                  data-testid="btn-admin-mobile-menu"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-lg lg:text-xl font-bold text-foreground">
                    {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                  </h1>
                  <p className="text-sm text-muted-foreground hidden sm:block">
                    Willkommen zurück, {user.fullName || user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="hidden sm:flex">
                  Admin
                </Badge>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="p-4 lg:p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
