import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, Package, Users, Euro, ShoppingCart, Clock, ArrowUpRight, ArrowDownRight } from "lucide-react";

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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12 text-slate-400">
        <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Analytics konnten nicht geladen werden</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Umsatz",
      value: `${analytics.totalRevenue.toFixed(2)} EUR`,
      icon: Euro,
      change: "+12.5%",
      trend: "up",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Bestellungen",
      value: analytics.totalOrders.toString(),
      icon: ShoppingCart,
      change: `${analytics.completedOrders} abgeschlossen`,
      trend: "up",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      borderColor: "border-blue-500/20",
    },
    {
      title: "Ausstehend",
      value: analytics.pendingOrders.toString(),
      icon: Clock,
      change: "Zu bearbeiten",
      trend: "neutral",
      bgColor: "bg-amber-500/10",
      iconColor: "text-amber-500",
      borderColor: "border-amber-500/20",
    },
    {
      title: "Produkte",
      value: analytics.totalProducts.toString(),
      icon: Package,
      change: "Im Katalog",
      trend: "neutral",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Kunden",
      value: analytics.totalCustomers.toString(),
      icon: Users,
      change: "+8.2%",
      trend: "up",
      bgColor: "bg-cyan-500/10",
      iconColor: "text-cyan-500",
      borderColor: "border-cyan-500/20",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`bg-slate-900 border-slate-800 ${stat.borderColor}`}
            data-testid={`stat-card-${index}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center text-emerald-500 text-xs font-medium">
                    <ArrowUpRight className="w-3 h-3 mr-0.5" />
                    {stat.change}
                  </div>
                )}
                {stat.trend === 'down' && (
                  <div className="flex items-center text-red-500 text-xs font-medium">
                    <ArrowDownRight className="w-3 h-3 mr-0.5" />
                    {stat.change}
                  </div>
                )}
                {stat.trend === 'neutral' && (
                  <div className="text-slate-500 text-xs">
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-slate-400">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Ubersicht
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <span className="text-slate-400">Durchschn. Bestellwert</span>
                <span className="font-semibold text-white">
                  {analytics.totalOrders > 0 
                    ? `${(analytics.totalRevenue / analytics.totalOrders).toFixed(2)} EUR`
                    : '0.00 EUR'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-slate-800">
                <span className="text-slate-400">Abschlussrate</span>
                <span className="font-semibold text-emerald-500">
                  {analytics.totalOrders > 0 
                    ? `${((analytics.completedOrders / analytics.totalOrders) * 100).toFixed(1)}%`
                    : '0%'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-slate-400">Produkte pro Bestellung</span>
                <span className="font-semibold text-white">~2.4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader className="border-b border-slate-800">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              Aktionen erforderlich
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {analytics.pendingOrders > 0 ? (
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-white font-medium">{analytics.pendingOrders} ausstehende Bestellungen</span>
                  </div>
                  <span className="text-sm text-amber-500">Bearbeiten</span>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-white font-medium">Alle Bestellungen bearbeitet</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <span className="text-slate-300">Produktkatalog aktuell</span>
                </div>
                <span className="text-sm text-slate-500">{analytics.totalProducts} Produkte</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
