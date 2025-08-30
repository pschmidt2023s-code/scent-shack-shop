import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  Euro, 
  Check, 
  X, 
  Eye, 
  Edit,
  Banknote,
  TrendingUp
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
  partners: {
    partner_code: string;
    profiles: {
      full_name: string;
    };
  };
}

export default function PartnerManagement() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PartnerPayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [payoutNotes, setPayoutNotes] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load partners
      const { data: partnersData, error: partnersError } = await supabase
        .from('partners')
        .select(`
          *,
          profiles!partners_user_id_fkey(full_name)
        `)
        .order('created_at', { ascending: false });

      if (partnersError) throw partnersError;
      setPartners(partnersData as any || []);

      // Load pending payouts
      const { data: payoutsData, error: payoutsError } = await supabase
        .from('partner_payouts')
        .select(`
          *,
          partners!inner(
            partner_code,
            profiles!partners_user_id_fkey(full_name)
          )
        `)
        .order('requested_at', { ascending: false });

      if (payoutsError) throw payoutsError;
      setPayouts(payoutsData as any || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const updatePartnerStatus = async (partnerId: string, status: string) => {
    try {
      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      const { error } = await supabase
        .from('partners')
        .update(updateData)
        .eq('id', partnerId);

      if (error) throw error;

      toast.success('Partner-Status aktualisiert');
      await loadData();
    } catch (error: any) {
      console.error('Error updating partner status:', error);
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    }
  };

  const updateCommissionRate = async (partnerId: string, rate: number) => {
    if (rate < 0 || rate > 5) {
      toast.error('Provision muss zwischen 0 und 5€ liegen');
      return;
    }

    try {
      const { error } = await supabase
        .from('partners')
        .update({ 
          commission_rate: rate,
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerId);

      if (error) throw error;

      toast.success('Provision aktualisiert');
      await loadData();
    } catch (error: any) {
      console.error('Error updating commission:', error);
      toast.error('Fehler beim Aktualisieren: ' + error.message);
    }
  };

  const processPayout = async (payoutId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('partner_payouts')
        .update({
          status,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          notes: notes || null
        })
        .eq('id', payoutId);

      if (error) throw error;

      // If completing payout, update partner's paid_out amount
      if (status === 'completed' && selectedPayout) {
        const { error: partnerError } = await supabase
          .from('partners')
          .update({
            total_paid_out: selectedPayout.amount
          })
          .eq('id', selectedPayout.partner_id);

        if (partnerError) throw partnerError;
      }

      toast.success('Auszahlung bearbeitet');
      setSelectedPayout(null);
      setPayoutNotes('');
      await loadData();
    } catch (error: any) {
      console.error('Error processing payout:', error);
      toast.error('Fehler bei der Bearbeitung: ' + error.message);
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

  const getPayoutStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      requested: 'secondary',
      processing: 'outline',
      completed: 'default',
      rejected: 'destructive'
    };
    
    const labels: Record<string, string> = {
      requested: 'Beantragt',
      processing: 'In Bearbeitung',
      completed: 'Ausgezahlt',
      rejected: 'Abgelehnt'
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedPartner(partner)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Partner Details</DialogTitle>
                        </DialogHeader>
                        {selectedPartner && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Status</Label>
                                <Select 
                                  value={selectedPartner.status}
                                  onValueChange={(value) => updatePartnerStatus(selectedPartner.id, value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Wartend</SelectItem>
                                    <SelectItem value="approved">Genehmigt</SelectItem>
                                    <SelectItem value="rejected">Abgelehnt</SelectItem>
                                    <SelectItem value="suspended">Gesperrt</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label>Provision (€)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  max="5"
                                  step="0.10"
                                  value={selectedPartner.commission_rate}
                                  onChange={(e) => updateCommissionRate(selectedPartner.id, parseFloat(e.target.value))}
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Gesamtumsatz</Label>
                                <p className="text-lg font-bold">€{selectedPartner.total_sales.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label>Provision verdient</Label>
                                <p className="text-lg font-bold">€{selectedPartner.total_commission.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label>Ausgezahlt</Label>
                                <p className="text-lg font-bold">€{selectedPartner.total_paid_out.toFixed(2)}</p>
                              </div>
                            </div>

                            {selectedPartner.application_data && (
                              <div>
                                <Label>Bewerbungsdaten</Label>
                                <div className="bg-muted p-3 rounded text-sm space-y-2">
                                  {selectedPartner.application_data.company_name && (
                                    <p><strong>Firma:</strong> {selectedPartner.application_data.company_name}</p>
                                  )}
                                  {selectedPartner.application_data.website && (
                                    <p><strong>Website:</strong> {selectedPartner.application_data.website}</p>
                                  )}
                                  {selectedPartner.application_data.social_media && (
                                    <p><strong>Social Media:</strong> {selectedPartner.application_data.social_media}</p>
                                  )}
                                  {selectedPartner.application_data.experience && (
                                    <p><strong>Erfahrung:</strong> {selectedPartner.application_data.experience}</p>
                                  )}
                                  {selectedPartner.application_data.motivation && (
                                    <p><strong>Motivation:</strong> {selectedPartner.application_data.motivation}</p>
                                  )}
                                </div>
                              </div>
                            )}

                            {selectedPartner.bank_details && (
                              <div>
                                <Label>Bankverbindung</Label>
                                <div className="bg-muted p-3 rounded text-sm space-y-1">
                                  <p><strong>Kontoinhaber:</strong> {selectedPartner.bank_details.account_holder}</p>
                                  <p><strong>IBAN:</strong> {selectedPartner.bank_details.iban}</p>
                                  <p><strong>BIC:</strong> {selectedPartner.bank_details.bic}</p>
                                  <p><strong>Bank:</strong> {selectedPartner.bank_details.bank_name}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Provision:</span>
                    <p className="font-medium">€{partner.commission_rate.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Umsatz:</span>
                    <p className="font-medium">€{partner.total_sales.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Verdient:</span>
                    <p className="font-medium">€{partner.total_commission.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ausgezahlt:</span>
                    <p className="font-medium">€{partner.total_paid_out.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}

            {partners.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Partner gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payouts */}
      <Card>
        <CardHeader>
          <CardTitle>Auszahlungen verwalten</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payouts.map((payout) => (
              <div key={payout.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">
                      {payout.partners.profiles.full_name} ({payout.partners.partner_code})
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      €{payout.amount.toFixed(2)} • Beantragt: {new Date(payout.requested_at).toLocaleDateString('de-DE')}
                    </p>
                    {payout.processed_at && (
                      <p className="text-xs text-muted-foreground">
                        Bearbeitet: {new Date(payout.processed_at).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getPayoutStatusBadge(payout.status)}
                    {payout.status === 'requested' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPayout(payout)}
                          >
                            Bearbeiten
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Auszahlung bearbeiten</DialogTitle>
                          </DialogHeader>
                          {selectedPayout && (
                            <div className="space-y-4">
                              <div>
                                <Label>Partner</Label>
                                <p className="font-medium">{selectedPayout.partners.profiles.full_name}</p>
                              </div>
                              <div>
                                <Label>Betrag</Label>
                                <p className="text-lg font-bold">€{selectedPayout.amount.toFixed(2)}</p>
                              </div>
                              <div>
                                <Label>Bankverbindung</Label>
                                <div className="bg-muted p-3 rounded text-sm space-y-1">
                                  <p><strong>Kontoinhaber:</strong> {selectedPayout.bank_details.account_holder}</p>
                                  <p><strong>IBAN:</strong> {selectedPayout.bank_details.iban}</p>
                                  <p><strong>BIC:</strong> {selectedPayout.bank_details.bic}</p>
                                  <p><strong>Bank:</strong> {selectedPayout.bank_details.bank_name}</p>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="notes">Notizen (optional)</Label>
                                <Textarea
                                  id="notes"
                                  value={payoutNotes}
                                  onChange={(e) => setPayoutNotes(e.target.value)}
                                  placeholder="Interne Notizen..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => processPayout(selectedPayout.id, 'completed', payoutNotes)}
                                  className="flex-1"
                                >
                                  <Check className="w-4 h-4 mr-1" />
                                  Auszahlung bestätigen
                                </Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => processPayout(selectedPayout.id, 'rejected', payoutNotes)}
                                  className="flex-1"
                                >
                                  <X className="w-4 h-4 mr-1" />
                                  Ablehnen
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {payouts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Auszahlungen gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}