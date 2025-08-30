import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Users, 
  Euro, 
  Copy, 
  Check, 
  TrendingUp, 
  Banknote,
  ExternalLink,
  Share2
} from 'lucide-react';

interface Partner {
  id: string;
  partner_code: string;
  status: string;
  commission_rate: number;
  total_sales: number;
  total_commission: number;
  total_paid_out: number;
  bank_details?: any;
  created_at: string;
  approved_at?: string;
}

interface PartnerSale {
  id: string;
  commission_amount: number;
  status: string;
  created_at: string;
  order: {
    order_number: string;
    total_amount: number;
    customer_name: string;
  };
}

interface PartnerPayout {
  id: string;
  amount: number;
  status: string;
  requested_at: string;
  processed_at?: string;
  notes?: string;
}

export default function Partner() {
  const { user } = useAuth();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [sales, setSales] = useState<PartnerSale[]>([]);
  const [payouts, setPayouts] = useState<PartnerPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    iban: '',
    bic: '',
    bank_name: ''
  });
  const [payoutAmount, setPayoutAmount] = useState('');
  const [applicationData, setApplicationData] = useState({
    company_name: '',
    website: '',
    social_media: '',
    experience: '',
    motivation: ''
  });

  useEffect(() => {
    if (user) {
      loadPartnerData();
    }
  }, [user]);

  const loadPartnerData = async () => {
    try {
      // Load partner data
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (partnerError && partnerError.code !== 'PGRST116') {
        throw partnerError;
      }

      if (partnerData) {
        setPartner(partnerData);
        setBankDetails(partnerData.bank_details as any || bankDetails);

        // Load sales data
        const { data: salesData, error: salesError } = await supabase
          .from('partner_sales')
          .select(`
            *,
            orders!inner(order_number, total_amount, customer_name)
          `)
          .eq('partner_id', partnerData.id)
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;
        setSales((salesData || []).map(sale => ({
          ...sale,
          order: sale.orders
        })) as any);

        // Load payouts data
        const { data: payoutsData, error: payoutsError } = await supabase
          .from('partner_payouts')
          .select('*')
          .eq('partner_id', partnerData.id)
          .order('requested_at', { ascending: false });

        if (payoutsError) throw payoutsError;
        setPayouts(payoutsData || []);
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
      toast.error('Fehler beim Laden der Partner-Daten');
    } finally {
      setLoading(false);
    }
  };

  const applyAsPartner = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('apply-partner', {
        body: {
          application_data: applicationData,
          bank_details: bankDetails
        }
      });

      if (error) throw error;

      toast.success('Bewerbung wurde eingereicht! Sie erhalten eine Bestätigung per E-Mail.');
      await loadPartnerData();
    } catch (error: any) {
      console.error('Error applying as partner:', error);
      toast.error('Fehler bei der Bewerbung: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const requestPayout = async () => {
    if (!partner || !payoutAmount) return;

    const amount = parseFloat(payoutAmount);
    const availableAmount = partner.total_commission - partner.total_paid_out;

    if (amount > availableAmount) {
      toast.error('Auszahlungsbetrag übersteigt verfügbares Guthaben');
      return;
    }

    if (amount < 10) {
      toast.error('Mindestbetrag für Auszahlung: 10€');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('partner_payouts')
        .insert({
          partner_id: partner.id,
          amount,
          bank_details: bankDetails
        });

      if (error) throw error;

      toast.success('Auszahlungsantrag wurde eingereicht');
      setPayoutAmount('');
      await loadPartnerData();
    } catch (error: any) {
      console.error('Error requesting payout:', error);
      toast.error('Fehler bei der Auszahlung: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${partner?.partner_code}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral-Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Partner Application Form
  if (!partner) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Partner werden</h1>
              <p className="text-muted-foreground">
                Werden Sie Partner und verdienen Sie 2,50€ Provision pro Verkauf
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Partner-Bewerbung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company_name">Firmenname (optional)</Label>
                    <Input
                      id="company_name"
                      value={applicationData.company_name}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        company_name: e.target.value
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website (optional)</Label>
                    <Input
                      id="website"
                      value={applicationData.website}
                      onChange={(e) => setApplicationData(prev => ({
                        ...prev,
                        website: e.target.value
                      }))}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="social_media">Social Media Profile</Label>
                  <Input
                    id="social_media"
                    value={applicationData.social_media}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      social_media: e.target.value
                    }))}
                    placeholder="Instagram, TikTok, YouTube, etc."
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Marketing Erfahrung</Label>
                  <Textarea
                    id="experience"
                    value={applicationData.experience}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      experience: e.target.value
                    }))}
                    placeholder="Beschreiben Sie Ihre Erfahrung im Marketing oder Verkauf..."
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Warum möchten Sie Partner werden?</Label>
                  <Textarea
                    id="motivation"
                    value={applicationData.motivation}
                    onChange={(e) => setApplicationData(prev => ({
                      ...prev,
                      motivation: e.target.value
                    }))}
                    placeholder="Was motiviert Sie..."
                  />
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Bankverbindung für Auszahlungen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="account_holder">Kontoinhaber</Label>
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
                      <Label htmlFor="bank_name">Bank</Label>
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
                      <Label htmlFor="iban">IBAN</Label>
                      <Input
                        id="iban"
                        value={bankDetails.iban}
                        onChange={(e) => setBankDetails(prev => ({
                          ...prev,
                          iban: e.target.value
                        }))}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="bic">BIC</Label>
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
                </div>

                <Button 
                  onClick={applyAsPartner} 
                  disabled={loading}
                  className="w-full"
                  size="lg"
                >
                  Als Partner bewerben
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Partner Dashboard
  const availableForPayout = partner.total_commission - partner.total_paid_out;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Partner Dashboard</h1>
          <div className="flex items-center gap-2">
            <span>Status:</span>
            {getStatusBadge(partner.status)}
            <span className="text-muted-foreground">• Code: {partner.partner_code}</span>
          </div>
        </div>

        {partner.status === 'pending' && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <p className="text-yellow-800">
                Ihre Partner-Bewerbung wird geprüft. Sie erhalten eine E-Mail sobald sie genehmigt wurde.
              </p>
            </CardContent>
          </Card>
        )}

        {partner.status === 'approved' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Gesamtumsatz</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{partner.total_sales.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Provision gesamt</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{partner.total_commission.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ausgezahlt</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">€{partner.total_paid_out.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Verfügbar</CardTitle>
                  <Euro className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">€{availableForPayout.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Referral Link */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Ihr Referral-Link
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={`${window.location.origin}?ref=${partner.partner_code}`}
                    readOnly
                    className="font-mono"
                  />
                  <Button onClick={copyReferralLink} variant="outline">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Teilen Sie diesen Link und erhalten Sie €{partner.commission_rate.toFixed(2)} pro Verkauf
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="sales" className="space-y-6">
              <TabsList>
                <TabsTrigger value="sales">Verkäufe</TabsTrigger>
                <TabsTrigger value="payouts">Auszahlungen</TabsTrigger>
              </TabsList>

              <TabsContent value="sales">
                <Card>
                  <CardHeader>
                    <CardTitle>Ihre Verkäufe</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {sales.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Noch keine Verkäufe vorhanden
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {sales.map((sale) => (
                          <div key={sale.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">#{sale.order.order_number}</p>
                              <p className="text-sm text-muted-foreground">
                                {sale.order.customer_name} • €{sale.order.total_amount.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(sale.created_at).toLocaleDateString('de-DE')}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-green-600">
                                +€{sale.commission_amount.toFixed(2)}
                              </p>
                              <Badge variant={sale.status === 'confirmed' ? 'default' : 'secondary'}>
                                {sale.status === 'confirmed' ? 'Bestätigt' : 'Wartend'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payouts">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Auszahlungen</CardTitle>
                    {availableForPayout >= 10 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button>Auszahlung beantragen</Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Auszahlung beantragen</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="payout-amount">Betrag (min. 10€)</Label>
                              <Input
                                id="payout-amount"
                                type="number"
                                min="10"
                                max={availableForPayout}
                                step="0.01"
                                value={payoutAmount}
                                onChange={(e) => setPayoutAmount(e.target.value)}
                                placeholder="0.00"
                              />
                              <p className="text-sm text-muted-foreground mt-1">
                                Verfügbar: €{availableForPayout.toFixed(2)}
                              </p>
                            </div>
                            <Button onClick={requestPayout} disabled={loading} className="w-full">
                              Auszahlung beantragen
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </CardHeader>
                  <CardContent>
                    {payouts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        Noch keine Auszahlungen beantragt
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {payouts.map((payout) => (
                          <div key={payout.id} className="flex justify-between items-center p-4 border rounded-lg">
                            <div>
                              <p className="font-medium">€{payout.amount.toFixed(2)}</p>
                              <p className="text-sm text-muted-foreground">
                                Beantragt: {new Date(payout.requested_at).toLocaleDateString('de-DE')}
                              </p>
                              {payout.processed_at && (
                                <p className="text-xs text-muted-foreground">
                                  Bearbeitet: {new Date(payout.processed_at).toLocaleDateString('de-DE')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge variant={
                                payout.status === 'completed' ? 'default' :
                                payout.status === 'rejected' ? 'destructive' : 'secondary'
                              }>
                                {payout.status === 'requested' ? 'Beantragt' :
                                 payout.status === 'processing' ? 'In Bearbeitung' :
                                 payout.status === 'completed' ? 'Ausgezahlt' : 'Abgelehnt'}
                              </Badge>
                              {payout.notes && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {payout.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}