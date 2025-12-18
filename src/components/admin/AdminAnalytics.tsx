import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Package, Users, Euro, ShoppingCart, Clock } from "lucide-react";

interface Analytics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/analytics", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to load analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Analytics konnten nicht geladen werden
      </div>
    );
  }

  const stats = [
    {
      title: "Gesamtumsatz",
      value: `${analytics.totalRevenue.toFixed(2)} EUR`,
      icon: Euro,
      description: "Gesamteinnahmen",
      color: "text-green-600",
    },
    {
      title: "Bestellungen",
      value: analytics.totalOrders,
      icon: ShoppingCart,
      description: `${analytics.completedOrders} abgeschlossen`,
      color: "text-blue-600",
    },
    {
      title: "Ausstehend",
      value: analytics.pendingOrders,
      icon: Clock,
      description: "Zu bearbeiten",
      color: "text-orange-600",
    },
    {
      title: "Produkte",
      value: analytics.totalProducts,
      icon: Package,
      description: "Im Katalog",
      color: "text-purple-600",
    },
    {
      title: "Kunden",
      value: analytics.totalCustomers,
      icon: Users,
      description: "Registrierte Benutzer",
      color: "text-indigo-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} data-testid={`stat-card-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schnellzugriff</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a
              href="#orders"
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              data-testid="link-quick-orders"
            >
              <ShoppingCart className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Bestellungen</span>
            </a>
            <a
              href="#products"
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              data-testid="link-quick-products"
            >
              <Package className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Produkte</span>
            </a>
            <a
              href="#customers"
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              data-testid="link-quick-customers"
            >
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Kunden</span>
            </a>
            <a
              href="#analytics"
              className="p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-center"
              data-testid="link-quick-analytics"
            >
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Statistiken</span>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
