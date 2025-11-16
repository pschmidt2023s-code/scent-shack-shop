import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function ReferralManagement() {
  const [loading, setLoading] = useState(true);
  const [commissionRate, setCommissionRate] = useState(10);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommission: 0,
    activePartners: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch commission rate setting
      const { data: setting } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'referral_commission_rate')
        .maybeSingle();

      if (setting && typeof setting.setting_value === 'object') {
        const value = setting.setting_value as any;
        setCommissionRate(value.percentage || 10);
      }

      // Fetch partners
      const { data: partners } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setReferrals(partners || []);

      // Calculate stats
      const totalCommission = partners?.reduce((sum, p) => sum + (p.total_commission || 0), 0) || 0;
      const activePartners = partners?.filter(p => p.status === 'approved').length || 0;

      setStats({
        totalReferrals: partners?.length || 0,
        totalCommission,
        activePartners,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const updateCommissionRate = async () => {
    try {
      const { error } = await supabase
        .from('system_settings')
        .update({
          setting_value: { percentage: commissionRate, enabled: true },
        })
        .eq('setting_key', 'referral_commission_rate');

      if (error) throw error;
      toast.success('Provisionssatz aktualisiert');
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('Fehler beim Speichern');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Empfehlungsprogramm-Verwaltung</h2>
        <p className="text-muted-foreground">Verwalte Partner und Provisionen</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Partner</p>
              <p className="text-2xl font-bold">{stats.totalReferrals}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Partner</p>
              <p className="text-2xl font-bold">{stats.activePartners}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Provision</p>
              <p className="text-2xl font-bold">€{stats.totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <Percent className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Provisionssatz</p>
              <p className="text-2xl font-bold">{commissionRate}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Provisions-Einstellungen</h3>
        <div className="flex items-end gap-4 max-w-md">
          <div className="flex-1">
            <Label>Standard-Provisionssatz (%)</Label>
            <Input
              type="number"
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              min="0"
              max="100"
              step="0.5"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Prozentsatz der Provision für alle Partner
            </p>
          </div>
          <Button onClick={updateCommissionRate}>Speichern</Button>
        </div>
      </Card>

      {/* Partners Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Partner-Übersicht</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Partner Code</TableHead>
              <TableHead>Gesamt Verkäufe</TableHead>
              <TableHead>Provision</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Erstellt</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {referrals.slice(0, 10).map((partner) => (
              <TableRow key={partner.id}>
                <TableCell className="font-mono font-semibold">{partner.partner_code}</TableCell>
                <TableCell>€{partner.total_sales?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>€{partner.total_commission?.toFixed(2) || '0.00'}</TableCell>
                <TableCell>
                  {partner.status === 'approved' ? (
                    <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                  ) : partner.status === 'pending' ? (
                    <Badge variant="secondary">Ausstehend</Badge>
                  ) : (
                    <Badge variant="destructive">{partner.status}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(partner.created_at).toLocaleDateString('de-DE')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
