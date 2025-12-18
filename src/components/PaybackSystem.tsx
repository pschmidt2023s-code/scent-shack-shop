import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Euro, TrendingUp, Calendar, CheckCircle, Clock, X } from 'lucide-react';

interface PaybackEarning {
  id: string;
  amount: number;
  description?: string;
  created_at: string;
  order_id?: string;
}

interface PaybackPayout {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  bank_details?: any;
}

export function PaybackSystem() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<PaybackEarning[]>([]);
  const [payouts, setPayouts] = useState<PaybackPayout[]>([]);
  const [paybackBalance, setPaybackBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    iban: '',
    bic: '',
    bank_name: ''
  });

  useEffect(() => {
    if (user) {
      loadPaybackData();
    }
  }, [user]);

  const loadPaybackData = async () => {
    try {
      // Load earnings
      const { data: earningsData, error: earningsError } = await supabase
        .from('payback_earnings')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (earningsError) throw earningsError;
      setEarnings(earningsData || []);

      // Load payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payback_payouts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (payoutsError) throw payoutsError;
      setPayouts(payoutsData || []);

      // Load balance from profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('payback_balance')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (profileError) throw profileError;
      setPaybackBalance(profileData?.payback_balance || 0);

    } catch (error) {
      console.error('Error loading payback data:', error);
      toast.error('Fehler beim Laden der Payback-Daten');
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!payoutAmount || parseFloat(payoutAmount) < 10) {
      toast.error('Mindestbetrag für Auszahlung: 10€');
      return;
    }

    if (parseFloat(payoutAmount) > paybackBalance) {
      toast.error('Auszahlungsbetrag übersteigt verfügbares Guthaben');
      return;
    }

    if (!bankDetails.account_holder || !bankDetails.iban || !bankDetails.bic || !bankDetails.bank_name) {
      toast.error('Bitte füllen Sie alle Bankdaten aus');
      return;
    }

    try {
      const { error } = await supabase
        .from('payback_payouts')
        .insert([{
          user_id: user?.id || '',
          amount: parseFloat(payoutAmount),
          bank_details: bankDetails,
          status: 'requested'
        }]);

      if (error) throw error;

      toast.success('Auszahlungsantrag wurde eingereicht');
      setPayoutAmount('');
      loadPaybackData();
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Fehler beim Einreichen der Auszahlung');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Euro className="w-5 h-5" />
            Payback-Guthaben
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            €{paybackBalance.toFixed(2)}
          </div>
          <p className="text-muted-foreground mt-2">
            Sie erhalten 5% Cashback auf alle Bestellungen
          </p>
        </CardContent>
      </Card>

      {/* Payout Request */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlung beantragen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payout-amount">Auszahlungsbetrag (Min. 10€)</Label>
            <Input
              id="payout-amount"
              type="number"
              step="0.01"
              min="10"
              max={paybackBalance}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              placeholder="Betrag eingeben"
            />
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="account_holder">Kontoinhaber *</Label>
              <Input
                id="account_holder"
                value={bankDetails.account_holder}
                onChange={(e) => setBankDetails(prev => ({
                  ...prev,
                  account_holder: e.target.value
                }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="bank_name">Bank *</Label>
              <Input
                id="bank_name"
                value={bankDetails.bank_name}
                onChange={(e) => setBankDetails(prev => ({
                  ...prev,
                  bank_name: e.target.value
                }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="iban">IBAN *</Label>
              <Input
                id="iban"
                value={bankDetails.iban}
                onChange={(e) => setBankDetails(prev => ({
                  ...prev,
                  iban: e.target.value
                }))}
                placeholder="DE89 3704 0044 0532 0130 00"
                required
              />
            </div>
            <div>
              <Label htmlFor="bic">BIC *</Label>
              <Input
                id="bic"
                value={bankDetails.bic}
                onChange={(e) => setBankDetails(prev => ({
                  ...prev,
                  bic: e.target.value
                }))}
                required
              />
            </div>
          </div>

          <Button
            onClick={requestPayout}
            disabled={!payoutAmount || parseFloat(payoutAmount) < 10}
            className="w-full"
          >
            Auszahlung beantragen
          </Button>
        </CardContent>
      </Card>

      {/* Earnings History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Payback-Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {earnings.length === 0 ? (
            <p className="text-muted-foreground">Noch keine Payback-Einträge vorhanden</p>
          ) : (
            <div className="space-y-4">
              {earnings.map((earning) => (
                <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Euro className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">€{earning.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        {earning.description || 'Cashback'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="default">Gutgeschrieben</Badge>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(earning.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Auszahlungen
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-muted-foreground">Noch keine Auszahlungen beantragt</p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {payout.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : payout.status === 'rejected' ? (
                        <X className="w-4 h-4 text-red-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-orange-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">€{payout.amount.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">
                        Beantragt am {new Date(payout.created_at).toLocaleDateString()}
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

export default PaybackSystem;