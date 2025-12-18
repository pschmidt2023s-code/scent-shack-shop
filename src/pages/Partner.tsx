import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { isValidIBAN, formatIBAN } from '@/lib/iban-validator';
import { 
  Users, 
  Euro, 
  Copy, 
  Check, 
  TrendingUp, 
  Share2,
  ArrowLeft
} from 'lucide-react';

interface Partner {
  id: string;
  partnerCode: string;
  status: string;
  commissionRate: string;
  totalEarnings: string;
  pendingEarnings: string;
  bankDetails?: any;
  createdAt: string;
}

interface PartnerSale {
  id: string;
  commissionAmount: string;
  status: string;
  createdAt: string;
}

export default function Partner() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [sales, setSales] = useState<PartnerSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bankDetails, setBankDetails] = useState({
    account_holder: '',
    iban: '',
    bic: '',
    bank_name: ''
  });
  const [applicationData, setApplicationData] = useState({
    first_name: '',
    last_name: '',
    address: '',
    motivation: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPartnerData();
  }, [user]);

  const loadPartnerData = async () => {
    try {
      const response = await fetch('/api/partners/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const partnerData = await response.json();
        setPartner(partnerData);
        setBankDetails(partnerData.bankDetails || bankDetails);

        const salesResponse = await fetch('/api/partners/me/sales', {
          credentials: 'include',
        });
        if (salesResponse.ok) {
          const salesData = await salesResponse.json();
          setSales(salesData || []);
        }
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!partner) return;
    const link = `${window.location.origin}?ref=${partner.partnerCode}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Link kopiert!');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyAsPartner = async () => {
    if (!applicationData.first_name || !applicationData.last_name) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          firstName: applicationData.first_name,
          lastName: applicationData.last_name,
          address: applicationData.address,
          motivation: applicationData.motivation,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Bewerbung fehlgeschlagen');
      }

      toast.success('Bewerbung erfolgreich eingereicht!');
      await loadPartnerData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const saveBankDetails = async () => {
    if (!isValidIBAN(bankDetails.iban)) {
      toast.error('Bitte geben Sie eine gültige IBAN ein');
      return;
    }

    try {
      const response = await fetch('/api/partners/me/bank', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(bankDetails),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      toast.success('Bankdaten gespeichert!');
    } catch (error) {
      toast.error('Fehler beim Speichern der Bankdaten');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background py-8 pb-32 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-4">Partner werden</h2>
              <p className="text-muted-foreground mb-6">
                Bitte melden Sie sich an, um Partner zu werden und Provisionen zu verdienen.
              </p>
              <Button onClick={() => navigate('/auth')}>
                Anmelden
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background py-8 pb-32 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Partner werden
              </CardTitle>
              <CardDescription>
                Verdienen Sie 2,5% Provision auf alle Verkäufe, die über Ihren Empfehlungslink generiert werden.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">2,5% Provision</h3>
                    <p className="text-sm text-muted-foreground">Auf jeden Verkauf</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <Share2 className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Einfach teilen</h3>
                    <p className="text-sm text-muted-foreground">Mit Ihrem persönlichen Link</p>
                  </CardContent>
                </Card>
                <Card className="bg-muted/50">
                  <CardContent className="pt-6 text-center">
                    <Euro className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold">Monatliche Auszahlung</h3>
                    <p className="text-sm text-muted-foreground">Ab 25€ Guthaben</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="first_name">Vorname *</Label>
                    <Input
                      id="first_name"
                      value={applicationData.first_name}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, first_name: e.target.value }))}
                      data-testid="input-partner-firstname"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Nachname *</Label>
                    <Input
                      id="last_name"
                      value={applicationData.last_name}
                      onChange={(e) => setApplicationData(prev => ({ ...prev, last_name: e.target.value }))}
                      data-testid="input-partner-lastname"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={applicationData.address}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, address: e.target.value }))}
                    data-testid="input-partner-address"
                  />
                </div>

                <div>
                  <Label htmlFor="motivation">Warum möchten Sie Partner werden?</Label>
                  <Textarea
                    id="motivation"
                    value={applicationData.motivation}
                    onChange={(e) => setApplicationData(prev => ({ ...prev, motivation: e.target.value }))}
                    placeholder="Erzählen Sie uns von sich..."
                    rows={4}
                    data-testid="input-partner-motivation"
                  />
                </div>

                <Button 
                  onClick={applyAsPartner} 
                  disabled={submitting}
                  className="w-full"
                  data-testid="button-apply-partner"
                >
                  {submitting ? 'Wird gesendet...' : 'Als Partner bewerben'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default">Aktiv</Badge>;
      case 'pending':
        return <Badge variant="secondary">Ausstehend</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Abgelehnt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingEarnings = parseFloat(partner.pendingEarnings || '0');
  const totalEarnings = parseFloat(partner.totalEarnings || '0');

  return (
    <div className="min-h-screen bg-background py-8 pb-32 md:pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Zurück
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold">Partner Dashboard</h1>
          <div className="flex items-center gap-2 mt-1">
            {getStatusBadge(partner.status)}
            <span className="text-muted-foreground">Partner seit {new Date(partner.createdAt).toLocaleDateString('de-DE')}</span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ausstehend</p>
                  <p className="text-2xl font-bold">{pendingEarnings.toFixed(2)} €</p>
                </div>
                <Euro className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gesamt verdient</p>
                  <p className="text-2xl font-bold">{totalEarnings.toFixed(2)} €</p>
                </div>
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Provision</p>
                  <p className="text-2xl font-bold">{parseFloat(partner.commissionRate).toFixed(1)}%</p>
                </div>
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {partner.status === 'approved' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ihr Empfehlungslink</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}?ref=${partner.partnerCode}`}
                  className="font-mono text-sm"
                />
                <Button onClick={copyReferralLink} variant="outline" data-testid="button-copy-link">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Teilen Sie diesen Link, um Provisionen zu verdienen.
              </p>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="sales">
          <TabsList className="w-full md:w-auto">
            <TabsTrigger value="sales">Verkäufe</TabsTrigger>
            <TabsTrigger value="bank">Bankdaten</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Ihre Verkäufe</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Noch keine Verkäufe. Teilen Sie Ihren Empfehlungslink!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {sales.map((sale) => (
                      <div key={sale.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{parseFloat(sale.commissionAmount).toFixed(2)} € Provision</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(sale.createdAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                        <Badge variant={sale.status === 'paid' ? 'default' : 'secondary'}>
                          {sale.status === 'paid' ? 'Ausgezahlt' : 'Ausstehend'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bank" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Bankdaten für Auszahlungen</CardTitle>
                <CardDescription>
                  Hinterlegen Sie Ihre Bankdaten für automatische Auszahlungen ab 25€ Guthaben.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="account_holder">Kontoinhaber</Label>
                  <Input
                    id="account_holder"
                    value={bankDetails.account_holder}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, account_holder: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    value={formatIBAN(bankDetails.iban)}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value.replace(/\s/g, '') }))}
                    placeholder="DE89 3704 0044 0532 0130 00"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="bic">BIC</Label>
                    <Input
                      id="bic"
                      value={bankDetails.bic}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bic: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bank_name">Bank</Label>
                    <Input
                      id="bank_name"
                      value={bankDetails.bank_name}
                      onChange={(e) => setBankDetails(prev => ({ ...prev, bank_name: e.target.value }))}
                    />
                  </div>
                </div>
                <Button onClick={saveBankDetails} data-testid="button-save-bank">
                  Bankdaten speichern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
