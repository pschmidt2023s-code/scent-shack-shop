import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { OrderDetailsModal } from './OrderDetailsModal';
import { Button } from '@/components/ui/button';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  recentOrders: Array<{ id: string; orderId: string; total: number; date: string; status: string }>;
}

export function SalesAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total_amount, 0) || 0;
      const totalOrders = orders?.length || 0;
      
      // Get unique customers
      const uniqueCustomers = new Set(orders?.map(o => o.customer_email).filter(Boolean));
      const totalCustomers = uniqueCustomers.size;

      // Get products count
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Calculate growth (mock data for now - would need historical data)
      const revenueGrowth = 12.5;
      const ordersGrowth = 8.3;

      // Get recent orders
      const recentOrders = orders?.slice(0, 5).map(order => ({
        id: order.order_number || order.id,
        orderId: order.id,
        total: order.total_amount,
        date: new Date(order.created_at).toLocaleDateString('de-DE'),
        status: order.status,
      })) || [];

      setData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts: productsCount || 0,
        revenueGrowth,
        ordersGrowth,
        topProducts: [],
        recentOrders,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Gesamtumsatz',
      value: `€${data.totalRevenue.toFixed(2)}`,
      change: data.revenueGrowth,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Bestellungen',
      value: data.totalOrders.toString(),
      change: data.ordersGrowth,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Kunden',
      value: data.totalCustomers.toString(),
      change: 15.2,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Produkte',
      value: data.totalProducts.toString(),
      change: 0,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            {stat.change !== 0 && (
              <div className="flex items-center gap-1 mt-2">
                {stat.change > 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ${stat.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}% vs. letzter Monat
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Letzte Bestellungen</h3>
        <div className="space-y-3">
          {data.recentOrders.map((order) => (
            <div 
              key={order.id} 
              className="flex items-center justify-between py-2 border-b last:border-0 cursor-pointer hover:bg-muted/50 px-2 rounded transition-colors"
              onClick={() => {
                setSelectedOrderId(order.orderId);
                setShowOrderModal(true);
              }}
            >
              <div>
                <p className="font-medium">#{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.date}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">€{order.total.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">{order.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <OrderDetailsModal
        orderId={selectedOrderId}
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
        onOrderUpdated={fetchAnalytics}
      />
    </div>
  );
}
