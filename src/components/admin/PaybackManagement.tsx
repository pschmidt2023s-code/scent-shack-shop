import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Euro, 
  TrendingUp,
  Users
} from 'lucide-react';

interface PaybackEarning {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  created_at: string;
  order_id?: string;
}

interface PaybackPayout {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_details: any;
  created_at: string;
}

interface PaybackManagementProps {
  onUpdate?: () => void;
}

export function PaybackManagement({ onUpdate }: PaybackManagementProps = {}) {
  const [earnings, setEarnings] = useState<PaybackEarning[]>([]);
  const [payouts, setPayouts] = useState<PaybackPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: earningsData } = await supabase
        .from('payback_earnings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: payoutsData } = await supabase
        .from('payback_payouts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      setEarnings(earningsData || []);
      setPayouts(payoutsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
      requested: 'outline'
    };
    
    const labels: Record<string, string> = {
      pending: 'Wartend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      requested: 'Angefragt'
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalPayouts = payouts.reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Gutschriften</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamt Auszahlungen</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalPayouts.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Auszahlungen</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payouts.filter(p => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Nutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(earnings.map(e => e.user_id)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Payback Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Payback-Gutschriften</CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Gutschriften vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.slice(0, 10).map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Euro className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">€{Number(earning.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.description || 'Cashback'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(earning.created_at).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlungsanträge</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Auszahlungsanträge vorhanden
            </div>
          ) : (
            <div className="space-y-4">
              {payouts.slice(0, 10).map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Euro className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">€{Number(payout.amount).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Beantragt am {new Date(payout.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(payout.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaybackManagement;
