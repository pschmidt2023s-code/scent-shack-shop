import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  Check, 
  Eye, 
  Banknote,
} from 'lucide-react';

interface Partner {
  id: string;
  user_id: string;
  partner_code: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  total_paid_out: number;
  bank_details?: any;
  application_data?: any;
  created_at: string;
  approved_at?: string;
  profiles?: {
    full_name: string;
  };
}

interface PartnerPayout {
  id: string;
  partner_id: string;
  amount: number;
  status: string;
  bank_details: any;
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await fetch('/api/partners', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to load partners');
      }
      
      const data = await response.json();
      setPartners(data || []);
      setPayouts([]);
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
      suspended: 'outline'
    };
    
    const labels: Record<string, string> = {
      pending: 'Wartend',
      approved: 'Genehmigt',
      rejected: 'Abgelehnt',
      suspended: 'Gesperrt'
    };

    return <Badge variant={variants[status] || 'secondary'}>{labels[status] || status}</Badge>;
  };

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
            <CardTitle className="text-sm font-medium">Partner gesamt</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partners.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Partner</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === 'approved').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wartende Bewerbungen</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {partners.filter(p => p.status === 'pending').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Auszahlungen</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {payouts.filter(p => p.status === 'requested').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <CardTitle>Partner verwalten</CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Noch keine Partner vorhanden. Das Partner-System wird noch eingerichtet.
            </div>
          ) : (
            <div className="space-y-4">
              {partners.map((partner) => (
                <div key={partner.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">
                        {partner.profiles?.full_name || 'Unbekannt'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Code: {partner.partner_code} • Erstellt: {new Date(partner.created_at).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(partner.status)}
                    </div>
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
