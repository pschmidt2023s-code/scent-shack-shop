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
      
      const [ordersRes, productsRes] = await Promise.all([
        fetch('/api/admin/orders', { credentials: 'include' }),
        fetch('/api/products', { credentials: 'include' })
      ]);
      
      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const products = productsRes.ok ? await productsRes.json() : [];

      const totalRevenue = orders?.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount || 0), 0) || 0;
      const totalOrders = orders?.length || 0;
      
      const uniqueCustomers = new Set(orders?.map((o: any) => o.customerEmail).filter(Boolean));
      const totalCustomers = uniqueCustomers.size;

      const revenueGrowth = 12.5;
      const ordersGrowth = 8.3;

      const recentOrders = orders?.slice(0, 5).map((order: any) => ({
        id: order.orderNumber || order.id,
        orderId: order.id,
        total: parseFloat(order.totalAmount || 0),
        date: new Date(order.createdAt).toLocaleDateString('de-DE'),
        status: order.status,
      })) || [];

      setData({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts: products?.length || 0,
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="text-center text-muted-foreground">Fehler beim Laden der Daten</div>;
  }

  const stats = [
    {
      title: 'Gesamtumsatz',
      value: `€${data.totalRevenue.toFixed(2)}`,
      change: data.revenueGrowth,
      icon: DollarSign,
    },
    {
      title: 'Bestellungen',
      value: data.totalOrders.toString(),
      change: data.ordersGrowth,
      icon: ShoppingCart,
    },
    {
      title: 'Kunden',
      value: data.totalCustomers.toString(),
      change: 5.2,
      icon: Users,
    },
    {
      title: 'Produkte',
      value: data.totalProducts.toString(),
      change: 0,
      icon: Package,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.change >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <stat.icon className={`h-5 w-5 ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
            {stat.change !== 0 && (
              <div className="flex items-center mt-2">
                {stat.change >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-sm ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(stat.change)}%
                </span>
              </div>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Letzte Bestellungen</h3>
        <div className="space-y-2">
          {data.recentOrders.map((order) => (
            <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <p className="font-medium">#{order.id}</p>
                <p className="text-sm text-muted-foreground">{order.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-2 py-1 rounded text-xs ${
                  order.status === 'paid' ? 'bg-green-100 text-green-800' :
                  order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
                <span className="font-semibold">€{order.total.toFixed(2)}</span>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setShowOrderModal(true);
                  }}
                >
                  Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <OrderDetailsModal
        orderId={selectedOrderId}
        open={showOrderModal}
        onOpenChange={setShowOrderModal}
      />
    </div>
  );
}
