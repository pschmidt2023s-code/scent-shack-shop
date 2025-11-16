import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BulkPaybackActions } from './BulkPaybackActions';
import { 
  Euro, 
  Check, 
  X, 
  Eye,
  TrendingUp,
  Users
} from 'lucide-react';

interface PaybackEarning {
  id: string;
  user_id: string;
  amount: number;
  percentage: number;
  status: string;
  earned_at: string;
  approved_at?: string;
  order_id?: string;
  profiles?: {
    full_name: string;
  };
}

interface PaybackPayout {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  bank_details: any;
  requested_at: string;
  approved_at?: string;
  notes?: string;
  profiles?: {
    full_name: string;
  };
}

interface PaybackManagementProps {
  onUpdate?: () => void;
}

export function PaybackManagement({ onUpdate }: PaybackManagementProps = {}) {
  const [earnings, setEarnings] = useState<PaybackEarning[]>([]);
  const [payouts, setPayouts] = useState<PaybackPayout[]>([]);
  const [selectedPayout, setSelectedPayout] = useState<PaybackPayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutNotes, setPayoutNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load payback earnings with profiles in a single optimized query
      const { data: earningsData, error: earningsError } = await supabase
        .from('payback_earnings')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('earned_at', { ascending: false });

      if (earningsError) throw earningsError;
      
      // Transform the data to match the expected format
      const earningsWithProfiles = (earningsData || []).map((earning: any) => ({
        ...earning,
        profiles: { full_name: earning.profiles?.full_name || 'Unbekannter Nutzer' }
      }));
      
      setEarnings(earningsWithProfiles);

      // Load payback payouts with profiles in a single optimized query
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('payback_payouts')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('requested_at', { ascending: false });

      if (payoutsError) throw payoutsError;

      // Transform the data to match the expected format
      const payoutsWithProfiles = (payoutsData || []).map((payout: any) => ({
        ...payout,
        profiles: { full_name: payout.profiles?.full_name || 'Unbekannter Nutzer' }
      }));

      setPayouts(payoutsWithProfiles);

    } catch (error) {
      console.error('Error loading payback data:', error);
      toast.error('Fehler beim Laden der Payback-Daten');
    } finally {
      setLoading(false);
    }
  };

  const updateEarningStatus = async (earningId: string, status: string) => {
    try {
      const updateData: any = { status };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;

        // Update user's payback balance optimistically
        const earning = earnings.find(e => e.id === earningId);
        if (earning) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('payback_balance')
            .eq('id', earning.user_id)
            .single();

          const currentBalance = profile?.payback_balance || 0;
          const newBalance = currentBalance + earning.amount;

          // Update both earning status and balance in parallel
          await Promise.all([
            supabase
              .from('payback_earnings')
              .update(updateData)
              .eq('id', earningId),
            supabase
              .from('profiles')
              .update({ payback_balance: newBalance })
              .eq('id', earning.user_id)
          ]);
        }
      } else {
        // Just update the earning status
        const { error } = await supabase
          .from('payback_earnings')
          .update(updateData)
          .eq('id', earningId);

        if (error) throw error;
      }

      toast.success(`Payback-Gutschrift ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}`);
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating earning status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
    }
  };

  const updatePayoutStatus = async (payoutId: string, status: string) => {
    try {
      const updateData: any = { status, notes: payoutNotes };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;

        // Subtract amount from user's payback balance
        const payout = payouts.find(p => p.id === payoutId);
        if (payout) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('payback_balance')
            .eq('id', payout.user_id)
            .single();

          const currentBalance = profile?.payback_balance || 0;
          const newBalance = Math.max(0, currentBalance - payout.amount);

          await supabase
            .from('profiles')
            .update({ payback_balance: newBalance })
            .eq('id', payout.user_id);
        }
      }

      const { error } = await supabase
        .from('payback_payouts')
        .update(updateData)
        .eq('id', payoutId);

      if (error) throw error;

      toast.success(`Auszahlung ${status === 'approved' ? 'genehmigt' : 'abgelehnt'}`);
      setSelectedPayout(null);
      setPayoutNotes('');
      loadData();
      onUpdate?.();
    } catch (error) {
      console.error('Error updating payout status:', error);
      toast.error('Fehler beim Aktualisieren des Status');
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Gutschriften</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{earnings.filter(e => e.status === 'pending').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auszahlungsanträge</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payouts.filter(p => p.status === 'requested').length}</div>
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

      {/* Bulk Actions */}
      <BulkPaybackActions earnings={earnings} onUpdate={loadData} />

      {/* Payback Earnings */}
      <Card>
        <CardHeader>
          <CardTitle>Payback-Gutschriften</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {earnings.filter(e => e.status === 'pending').map((earning) => (
              <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{earning.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    €{earning.amount.toFixed(2)} ({earning.percentage}% Cashback)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(earning.earned_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(earning.status)}
                  <Button
                    onClick={() => updateEarningStatus(earning.id, 'approved')}
                    size="sm"
                    variant="outline"
                    className="text-green-600 hover:text-green-700"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => updateEarningStatus(earning.id, 'rejected')}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            
            {earnings.filter(e => e.status === 'pending').length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Keine offenen Payback-Gutschriften
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payout Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlungsanträge</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.filter(p => p.status === 'requested').map((payout) => (
              <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{payout.profiles?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    €{payout.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Beantragt am {new Date(payout.requested_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(payout.status)}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => setSelectedPayout(payout)}
                        size="sm"
                        variant="outline"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Auszahlungsantrag prüfen</DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div>
                          <p><strong>Nutzer:</strong> {payout.profiles?.full_name}</p>
                          <p><strong>Betrag:</strong> €{payout.amount.toFixed(2)}</p>
                          <p><strong>Beantragt:</strong> {new Date(payout.requested_at).toLocaleDateString()}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Bankdaten:</h4>
                          <div className="bg-muted p-3 rounded text-sm">
                            <p><strong>Kontoinhaber:</strong> {payout.bank_details?.account_holder}</p>
                            <p><strong>IBAN:</strong> {payout.bank_details?.iban}</p>
                            <p><strong>BIC:</strong> {payout.bank_details?.bic}</p>
                            <p><strong>Bank:</strong> {payout.bank_details?.bank_name}</p>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="notes">Notizen</Label>
                          <Textarea
                            id="notes"
                            value={payoutNotes}
                            onChange={(e) => setPayoutNotes(e.target.value)}
                            placeholder="Optionale Notizen..."
                          />
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => updatePayoutStatus(payout.id, 'approved')}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Genehmigen
                          </Button>
                          <Button
                            onClick={() => updatePayoutStatus(payout.id, 'rejected')}
                            variant="destructive"
                            className="flex-1"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Ablehnen
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
            
            {payouts.filter(p => p.status === 'requested').length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Keine offenen Auszahlungsanträge
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PaybackManagement;