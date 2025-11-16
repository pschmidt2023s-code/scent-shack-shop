import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PaybackManagement } from './PaybackManagement';
import { ProductCashbackSettings } from './ProductCashbackSettings';
import { LoyaltyRulesSettings } from './LoyaltyRulesSettings';
import { 
  Wallet, 
  Percent, 
  Trophy,
  TrendingUp
} from 'lucide-react';

export function LoyaltySettings() {
  const [activeTab, setActiveTab] = useState('payback');
  const [stats, setStats] = useState({
    totalCashback: 0,
    pendingApprovals: 0,
    activeProducts: 0,
    avgCashbackRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Hole Payback-Statistiken
      const { data: earningsData } = await supabase
        .from('payback_earnings')
        .select('amount, status');

      const totalCashback = earningsData?.reduce((sum, e) => 
        e.status === 'approved' ? sum + Number(e.amount) : sum, 0
      ) || 0;

      const pendingApprovals = earningsData?.filter(e => 
        e.status === 'pending'
      ).length || 0;

      // Hole Produkt-Cashback-Statistiken
      const { data: variantsData } = await supabase
        .from('product_variants')
        .select('cashback_percentage, in_stock');

      const activeProducts = variantsData?.filter(v => v.in_stock).length || 0;
      const avgCashbackRate = variantsData?.length 
        ? variantsData.reduce((sum, v) => sum + Number(v.cashback_percentage || 0), 0) / variantsData.length
        : 5.0;

      setStats({
        totalCashback,
        pendingApprovals,
        activeProducts,
        avgCashbackRate
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header mit Statistiken */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Treueprogramm Verwaltung</h1>
        <p className="text-muted-foreground">
          Verwalte Payback, Cashback-Prozentsätze und Loyalty-Regeln
        </p>
      </div>

      {/* Statistik-Karten */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Gesamt Cashback</p>
              <p className="text-2xl font-bold">{stats.totalCashback.toFixed(2)}€</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Ausstehende Genehmigungen</p>
              <p className="text-2xl font-bold">{stats.pendingApprovals}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-green-500" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Aktive Produkte</p>
              <p className="text-2xl font-bold">{stats.activeProducts}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2">
            <Percent className="h-5 w-5 text-blue-500" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Ø Cashback-Rate</p>
              <p className="text-2xl font-bold">{stats.avgCashbackRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs für verschiedene Bereiche */}
      <Card className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="payback" className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Payback Verwaltung
            </TabsTrigger>
            <TabsTrigger value="cashback" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Produktspezifisches Cashback
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Loyalty-Regeln
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payback" className="mt-6">
            <PaybackManagement onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="cashback" className="mt-6">
            <ProductCashbackSettings onUpdate={fetchStats} />
          </TabsContent>

          <TabsContent value="loyalty" className="mt-6">
            <LoyaltyRulesSettings onUpdate={fetchStats} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
