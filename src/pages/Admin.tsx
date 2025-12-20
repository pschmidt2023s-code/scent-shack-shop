import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { getPerfumeNameById } from '@/lib/perfume-utils';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  Tag, 
  ShoppingCart, 
  Settings,
  LogOut,
  Eye,
  Trash2,
  MapPin,
  User,
  Mail,
  Gift,
  Percent,
  UserCheck,
  Menu,
  Home,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  Activity,
  Search,
  Filter,
  MoreHorizontal,
  ChevronRight,
  Bell,
  Sun,
  Moon,
  Trophy,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Truck
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';

const CouponManagement = lazy(() => import('@/components/admin/CouponManagement'));
const UserManagement = lazy(() => import('@/components/admin/UserManagement'));
const PartnerManagement = lazy(() => import('@/components/admin/PartnerManagement'));
const NewsletterManagement = lazy(() => import('@/components/admin/NewsletterManagement'));
const PaybackManagement = lazy(() => import('@/components/admin/PaybackManagement'));
const ContestManagement = lazy(() => import('@/components/admin/ContestManagement').then(module => ({ default: module.ContestManagement })));
const ProductManagement = lazy(() => import('@/components/admin/ProductManagement'));
const SettingsManagement = lazy(() => import('@/components/admin/SettingsManagement'));

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

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  revenueChange: number;
  ordersChange: number;
}

const navGroups = [
  {
    label: 'Übersicht',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Verkauf',
    items: [
      { id: 'orders', label: 'Bestellungen', icon: ShoppingCart },
      { id: 'products', label: 'Produkte', icon: Package },
      { id: 'coupons', label: 'Rabattcodes', icon: Tag },
    ],
  },
  {
    label: 'Kunden',
    items: [
      { id: 'users', label: 'Kunden', icon: Users },
      { id: 'partners', label: 'Partner', icon: UserCheck },
      { id: 'payback', label: 'Payback', icon: Percent },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { id: 'newsletter', label: 'Newsletter', icon: Mail },
      { id: 'contest', label: 'Gewinnspiel', icon: Gift },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'settings', label: 'Einstellungen', icon: Settings },
    ],
  },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loading-spinner" />
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  subtitle,
  iconColor = 'cyan'
}: { 
  title: string; 
  value: string; 
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ComponentType<{ className?: string }>;
  subtitle?: string;
  iconColor?: 'cyan' | 'purple' | 'pink' | 'green';
}) {
  return (
    <div 
      className="admin-stat-card rounded-xl p-6"
      data-testid={`stat-card-${title.toLowerCase().replace(/\s/g, '-')}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-white/70 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold tracking-tight text-white">{value}</p>
          {change && (
            <div className="flex items-center gap-1.5">
              {changeType === 'positive' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
              {changeType === 'negative' && <TrendingDown className="w-4 h-4 text-red-400" />}
              <span className={cn(
                "text-sm font-medium",
                changeType === 'positive' && "text-emerald-400",
                changeType === 'negative' && "text-red-400",
                changeType === 'neutral' && "text-white/60"
              )}>
                {change}
              </span>
            </div>
          )}
          {subtitle && <p className="text-xs text-white/50">{subtitle}</p>}
        </div>
        <div className={`admin-stat-icon ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

function DashboardOverview({ orders, stats, onViewAllOrders, onSelectOrder }: { 
  orders: Order[]; 
  stats: DashboardStats;
  onViewAllOrders: () => void;
  onSelectOrder: (order: Order) => void;
}) {
  const recentOrders = orders.slice(0, 5);
  
  const statusConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
    pending: { icon: Clock, color: 'text-yellow-500', label: 'Ausstehend' },
    pending_payment: { icon: AlertCircle, color: 'text-orange-500', label: 'Zahlung offen' },
    processing: { icon: Activity, color: 'text-blue-500', label: 'In Bearbeitung' },
    paid: { icon: CheckCircle2, color: 'text-green-500', label: 'Bezahlt' },
    shipped: { icon: Truck, color: 'text-purple-500', label: 'Versendet' },
    delivered: { icon: CheckCircle2, color: 'text-green-600', label: 'Zugestellt' },
    cancelled: { icon: XCircle, color: 'text-red-500', label: 'Storniert' },
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight admin-glow-text">Dashboard</h2>
        <p className="text-white/60 mt-1">Willkommen zurück! Hier ist Ihre Übersicht.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Gesamtumsatz"
          value={`€${stats.totalRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`}
          change={stats.revenueChange >= 0 ? `+${stats.revenueChange}%` : `${stats.revenueChange}%`}
          changeType={stats.revenueChange >= 0 ? 'positive' : 'negative'}
          icon={DollarSign}
          subtitle="Diesen Monat"
          iconColor="cyan"
        />
        <StatCard
          title="Bestellungen"
          value={stats.totalOrders.toString()}
          change={stats.ordersChange >= 0 ? `+${stats.ordersChange}%` : `${stats.ordersChange}%`}
          changeType={stats.ordersChange >= 0 ? 'positive' : 'negative'}
          icon={ShoppingCart}
          subtitle="Diesen Monat"
          iconColor="purple"
        />
        <StatCard
          title="Kunden"
          value={stats.totalCustomers.toString()}
          icon={Users}
          subtitle="Registrierte Nutzer"
          iconColor="pink"
        />
        <StatCard
          title="Ausstehend"
          value={stats.pendingOrders.toString()}
          icon={Clock}
          subtitle="Offene Bestellungen"
          iconColor="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-glass rounded-xl overflow-hidden">
          <div className="flex flex-row items-center justify-between gap-4 p-6 pb-4">
            <div>
              <h3 className="text-base font-semibold text-white">Letzte Bestellungen</h3>
              <p className="text-sm text-white/60">Die neuesten 5 Bestellungen</p>
            </div>
            <Button variant="ghost" size="sm" className="gap-1" onClick={onViewAllOrders} data-testid="btn-view-all-orders">
              Alle anzeigen <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="px-6 pb-6">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Keine Bestellungen vorhanden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const config = statusConfig[order.status] || statusConfig.pending;
                  const StatusIcon = config.icon;
                  return (
                    <div 
                      key={order.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => onSelectOrder(order)}
                      data-testid={`order-item-${order.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("p-2.5 rounded-xl", config.color)} style={{ background: 'hsl(215 45% 14% / 0.8)' }}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.customerName || 'Gast'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-cyan-400">
                          €{Number(order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('de-DE')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="admin-glass rounded-xl overflow-hidden">
          <div className="p-6 pb-4">
            <h3 className="text-base font-semibold text-white">Schnellzugriff</h3>
            <p className="text-sm text-white/60">Häufig verwendete Aktionen</p>
          </div>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 gap-4">
              <button className="admin-stat-card rounded-xl p-5 flex flex-col items-center gap-3 hover:border-cyan-500/30 transition-all group" data-testid="btn-quick-new-product">
                <div className="admin-stat-icon cyan">
                  <Package className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-cyan-400 transition-colors">Neues Produkt</span>
              </button>
              <button className="admin-stat-card rounded-xl p-5 flex flex-col items-center gap-3 hover:border-purple-500/30 transition-all group" data-testid="btn-quick-new-coupon">
                <div className="admin-stat-icon purple">
                  <Tag className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-purple-400 transition-colors">Neuer Rabattcode</span>
              </button>
              <button className="admin-stat-card rounded-xl p-5 flex flex-col items-center gap-3 hover:border-pink-500/30 transition-all group" data-testid="btn-quick-newsletter">
                <div className="admin-stat-icon pink">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-pink-400 transition-colors">Newsletter</span>
              </button>
              <button className="admin-stat-card rounded-xl p-5 flex flex-col items-center gap-3 hover:border-green-500/30 transition-all group" data-testid="btn-quick-analytics">
                <div className="admin-stat-icon green">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-white/90 group-hover:text-emerald-400 transition-colors">Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderDetailDialog({ order, onClose }: { order: Order | null; onClose: () => void }) {
  if (!order) return null;
  
  const statusConfig: Record<string, { label: string; color: string }> = {
    pending: { label: 'Ausstehend', color: 'text-yellow-500' },
    pending_payment: { label: 'Zahlung offen', color: 'text-orange-500' },
    processing: { label: 'In Bearbeitung', color: 'text-blue-500' },
    paid: { label: 'Bezahlt', color: 'text-green-500' },
    shipped: { label: 'Versendet', color: 'text-purple-500' },
    delivered: { label: 'Zugestellt', color: 'text-green-600' },
    cancelled: { label: 'Storniert', color: 'text-red-500' },
    completed: { label: 'Abgeschlossen', color: 'text-emerald-500' },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const items = order.orderItems || [];
  const shippingAddress = order.shippingAddressData || {};

  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Bestellung #{order.orderNumber || order.id.slice(-8).toUpperCase()}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Kunde</p>
              <p className="font-medium">{order.customerName || 'Gast'}</p>
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={cn("font-medium", config.color)}>{config.label}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Lieferadresse</p>
            <p className="text-sm">
              {shippingAddress.street || 'Keine Angabe'}<br />
              {shippingAddress.zip || ''} {shippingAddress.city || ''}<br />
              {shippingAddress.country || ''}
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground mb-2">Bestellte Artikel ({items.length})</p>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item: OrderItem & { variantName?: string; productName?: string }, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-md">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.variantName || 'Produkt'}</p>
                      <p className="text-xs text-muted-foreground">Menge: {item.quantity || 1} x €{Number(item.unitPrice || 0).toFixed(2)}</p>
                    </div>
                    <p className="text-sm font-semibold ml-2">€{Number(item.totalPrice || 0).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Artikel gefunden</p>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center font-semibold">
            <span>Gesamtsumme</span>
            <span className="text-lg text-primary">€{Number(order.totalAmount || 0).toFixed(2)}</span>
          </div>

          <div className="text-xs text-muted-foreground">
            Bestellt am {new Date(order.createdAt).toLocaleDateString('de-DE', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrdersView({ 
  orders, 
  onUpdateStatus, 
  onDelete, 
  onBulkDelete,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: { 
  orders: Order[];
  onUpdateStatus: (id: string, status: string) => void;
  onDelete: (id: string) => void;
  onBulkDelete: () => void;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
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
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bestellungen</h2>
          <p className="text-muted-foreground">{orders.length} Bestellungen insgesamt</p>
        </div>
        {selectedIds.length > 0 && (
          <Button variant="destructive" onClick={onBulkDelete} data-testid="btn-bulk-delete-orders">
            <Trash2 className="w-4 h-4 mr-2" />
            {selectedIds.length} löschen
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Bestellnummer, Kunde..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-orders"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]" data-testid="select-status-filter">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status filtern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Status</SelectItem>
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === filteredOrders.length && filteredOrders.length > 0}
                      onCheckedChange={onToggleSelectAll}
                      data-testid="checkbox-select-all-orders"
                    />
                  </TableHead>
                  <TableHead>Bestellung</TableHead>
                  <TableHead className="hidden md:table-cell">Kunde</TableHead>
                  <TableHead>Betrag</TableHead>
                  <TableHead className="hidden sm:table-cell">Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Datum</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      Keine Bestellungen gefunden
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id} data-testid={`row-order-${order.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(order.id)}
                          onCheckedChange={() => onToggleSelect(order.id)}
                          data-testid={`checkbox-order-${order.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-mono text-sm font-medium">
                          #{order.orderNumber || order.id.slice(-8).toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div>
                          <p className="text-sm font-medium truncate max-w-[150px]">
                            {order.customerName || 'Gast'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.customerEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        €{Number(order.totalAmount || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Select 
                          value={order.status} 
                          onValueChange={(value) => onUpdateStatus(order.id, value)}
                        >
                          <SelectTrigger className="h-8 w-[130px]" data-testid={`select-status-${order.id}`}>
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
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {new Date(order.createdAt).toLocaleDateString('de-DE')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" data-testid={`btn-order-menu-${order.id}`}>
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <Dialog>
                              <DialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  Details anzeigen
                                </DropdownMenuItem>
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
                                          <span className="font-semibold">€{Number(order.totalAmount || 0).toFixed(2)}</span>
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
                                          {order.orderItems.map((item: OrderItem & { variantName?: string }) => (
                                            <div key={item.id} className="p-3 flex justify-between text-sm">
                                              <span>{item.quantity}x {item.variantName || 'Produkt'}</span>
                                              <span className="font-medium">€{Number(item.totalPrice || 0).toFixed(2)}</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => onDelete(order.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Löschen
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminSidebarNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary">
            <Package className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">ALDENAIR</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="flex-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => onTabChange(item.id)}
                          className={cn(
                            "w-full justify-start gap-3 px-4 py-2.5",
                            isActive && "bg-primary/10 text-primary font-medium"
                          )}
                          data-testid={`nav-${item.id}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                          {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button variant="ghost" className="w-full justify-start gap-2" asChild>
          <Link to="/" data-testid="link-back-to-shop">
            <Home className="w-4 h-4" />
            Zurück zum Shop
          </Link>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function MobileNav({ activeTab, onTabChange, user, onSignOut }: { 
  activeTab: string; 
  onTabChange: (tab: string) => void;
  user: any;
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden" data-testid="btn-mobile-menu">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-4">
          <SheetTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            ALDENAIR Admin
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-140px)]">
          <div className="p-4 space-y-6">
            {navGroups.map((group) => (
              <div key={group.label} className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3"
                        onClick={() => handleTabChange(item.id)}
                        data-testid={`mobile-nav-${item.id}`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 right-0 border-t p-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.fullName || user?.email}</p>
                <p className="text-xs text-muted-foreground">Admin</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onSignOut} data-testid="btn-mobile-logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function Admin() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    revenueChange: 12.5,
    ordersChange: 8.2,
  });

  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, usersRes] = await Promise.all([
        fetch('/api/admin/orders', { credentials: 'include' }),
        fetch('/api/admin/users', { credentials: 'include' }),
      ]);
      
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData || []);
        
        const totalRevenue = ordersData.reduce((sum: number, o: Order) => sum + Number(o.totalAmount || 0), 0);
        const pendingOrders = ordersData.filter((o: Order) => 
          o.status === 'pending' || o.status === 'pending_payment'
        ).length;
        
        setStats(prev => ({
          ...prev,
          totalRevenue,
          totalOrders: ordersData.length,
          pendingOrders,
        }));
      }
      
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats(prev => ({
          ...prev,
          totalCustomers: usersData.length,
        }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

      await loadData();
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
  }, [loadData, toast]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete order');

      await loadData();
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
  }, [loadData, toast]);

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
      await loadData();
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
  }, [selectedOrderIds, loadData, toast]);

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

  if (loading) {
    return (
      <div className="dark admin-theme">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Lade Admin Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="dark admin-theme">
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <User className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Anmeldung erforderlich</h2>
              <p className="text-muted-foreground mb-6">
                Bitte melden Sie sich an, um auf das Admin Dashboard zuzugreifen.
              </p>
              <Button asChild className="w-full" data-testid="btn-login-redirect">
                <Link to="/">Zur Startseite</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="dark admin-theme">
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <Settings className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-bold mb-2">Zugriff verweigert</h2>
              <p className="text-muted-foreground mb-6">
                Sie haben keine Berechtigung für das Admin Dashboard.
              </p>
              <Button asChild className="w-full" data-testid="btn-access-denied-redirect">
                <Link to="/">Zur Startseite</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <>
            <DashboardOverview 
              orders={orders} 
              stats={stats} 
              onViewAllOrders={() => setActiveTab('orders')}
              onSelectOrder={(order) => setSelectedOrder(order)}
            />
            <OrderDetailDialog 
              order={selectedOrder} 
              onClose={() => setSelectedOrder(null)} 
            />
          </>
        );
      case 'orders':
        return (
          <OrdersView
            orders={orders}
            onUpdateStatus={updateOrderStatus}
            onDelete={deleteOrder}
            onBulkDelete={bulkDeleteOrders}
            selectedIds={selectedOrderIds}
            onToggleSelect={toggleOrderSelection}
            onToggleSelectAll={toggleSelectAll}
          />
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
      case 'settings':
        return (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsManagement />
          </Suspense>
        );
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Seite nicht gefunden</p>
          </div>
        );
    }
  };

  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <div className="dark admin-theme admin-shell">
      <SidebarProvider style={sidebarStyle}>
        <div className="flex min-h-screen w-full">
        <div className="hidden lg:block">
          <AdminSidebarNav activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 admin-header-bar">
            <div className="flex h-14 items-center justify-between gap-4 px-4">
              <div className="flex items-center gap-2">
                <MobileNav 
                  activeTab={activeTab} 
                  onTabChange={setActiveTab} 
                  user={user}
                  onSignOut={signOut}
                />
                <SidebarTrigger className="hidden lg:flex" data-testid="btn-sidebar-trigger" />
                <Separator orientation="vertical" className="h-6 hidden lg:block" />
                <h1 className="text-sm font-medium capitalize hidden sm:block">
                  {navGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'Dashboard'}
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" data-testid="btn-notifications">
                  <Bell className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2" data-testid="btn-user-menu">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-primary" />
                      </div>
                      <span className="hidden sm:inline-block max-w-[100px] truncate">
                        {user?.fullName || user?.email}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div>
                        <p className="font-medium">{user?.fullName || 'Admin'}</p>
                        <p className="text-xs text-muted-foreground">{user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/" className="w-full">
                        <Home className="w-4 h-4 mr-2" />
                        Zum Shop
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Abmelden
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
            {renderContent()}
          </main>
        </div>
      </div>
      </SidebarProvider>
    </div>
  );
}
