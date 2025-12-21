import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Gift, Star, Calendar, Award, TrendingUp, 
  Sparkles, Clock, ShoppingBag, PartyPopper, Cake, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

interface LoyaltyData {
  points: number;
  redeemableDiscount: number;
  tier: string;
  tierDiscount: number;
  totalSpent: number;
  autoRedeemPoints: boolean;
  birthday: string | null;
  memberSince: string;
  yearsAsMember: number;
  birthdayBonusAvailable: boolean;
  anniversaryBonusAvailable: boolean;
  isNewsletterSubscriber: boolean;
  transactions: Array<{
    id: string;
    type: string;
    points: number;
    description: string | null;
    createdAt: string;
  }>;
}

const TIER_COLORS = {
  bronze: 'bg-orange-700 text-white',
  silver: 'bg-gray-400 text-white',
  gold: 'bg-yellow-500 text-black',
  platinum: 'bg-gradient-to-r from-gray-300 to-gray-500 text-black',
};

const TIER_NAMES = {
  bronze: 'Bronze',
  silver: 'Silber',
  gold: 'Gold',
  platinum: 'Platin',
};

export function LoyaltyRewards() {
  const { toast } = useToast();
  const [birthday, setBirthday] = useState('');
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchLoyalty = async () => {
    try {
      const response = await fetch('/api/loyalty', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setLoyalty(data);
        if (data.birthday) setBirthday(data.birthday);
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const updateSettings = async (data: { birthday?: string; autoRedeemPoints?: boolean }) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/loyalty/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast({ title: 'Einstellungen gespeichert' });
        fetchLoyalty();
      }
    } catch (error) {
      toast({ title: 'Fehler beim Speichern', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const claimBirthdayBonus = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/loyalty/claim-birthday', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        toast({ 
          title: 'Geburtstags-Bonus erhalten!', 
          description: `Sie haben ${data.pointsAdded} Punkte erhalten.` 
        });
        fetchLoyalty();
      } else {
        toast({ title: data.error || 'Fehler', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Fehler beim Abholen', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const claimAnniversaryBonus = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/loyalty/claim-anniversary', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok) {
        toast({ 
          title: 'Jubiläums-Bonus erhalten!', 
          description: `Sie haben ${data.pointsAdded} Punkte erhalten.` 
        });
        fetchLoyalty();
      } else {
        toast({ title: data.error || 'Fehler', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Fehler beim Abholen', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto" />
          <p className="text-muted-foreground mt-2">Lade Treuepunkte...</p>
        </CardContent>
      </Card>
    );
  }

  const tierKey = (loyalty?.tier || 'bronze') as keyof typeof TIER_COLORS;

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-primary" />
            Ihre Treuepunkte
          </CardTitle>
          <CardDescription>
            Sammeln Sie Punkte bei jedem Einkauf und lösen Sie diese für Rabatte ein
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-card">
              <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">{loyalty?.points || 0}</p>
              <p className="text-sm text-muted-foreground">Aktuelle Punkte</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-card">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold">{loyalty?.redeemableDiscount || 0}€</p>
              <p className="text-sm text-muted-foreground">Einlösbar</p>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-card">
              <Badge className={`${TIER_COLORS[tierKey]} mx-auto mb-2 px-4 py-1`}>
                <Award className="w-4 h-4 mr-1" />
                {TIER_NAMES[tierKey]}
              </Badge>
              <p className="text-lg font-bold">{loyalty?.tierDiscount || 0}% Rabatt</p>
              <p className="text-sm text-muted-foreground">Dauerhaft</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              So funktioniert es
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">1€ = 10 Punkte</p>
                <p className="text-sm text-muted-foreground">
                  Bei jedem Einkauf sammeln Sie automatisch Punkte
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">100 Punkte = 1€ Rabatt</p>
                <p className="text-sm text-muted-foreground">
                  Lösen Sie Ihre Punkte beim nächsten Einkauf ein
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Cake className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">500 Punkte Geburtstags-Bonus</p>
                <p className="text-sm text-muted-foreground">
                  Hinterlegen Sie Ihr Geburtsdatum und erhalten Sie jährlich 500 Punkte
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <PartyPopper className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">200 Punkte Jubiläums-Bonus</p>
                <p className="text-sm text-muted-foreground">
                  Jedes Jahr als Mitglied erhalten Sie 200 Bonus-Punkte
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Einstellungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthday">Geburtsdatum</Label>
              <div className="flex gap-2">
                <Input
                  id="birthday"
                  type="date"
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  data-testid="input-birthday"
                />
                <Button 
                  onClick={() => updateSettings({ birthday })}
                  disabled={isSaving || !birthday}
                  data-testid="button-save-birthday"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Speichern'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Erhalten Sie 500 Punkte an Ihrem Geburtstag
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Punkte automatisch einlösen</Label>
                <p className="text-sm text-muted-foreground">
                  Punkte werden beim Checkout automatisch als Rabatt angewendet
                </p>
              </div>
              <Switch
                checked={loyalty?.autoRedeemPoints ?? true}
                onCheckedChange={(checked) => updateSettings({ autoRedeemPoints: checked })}
                disabled={isSaving}
                data-testid="switch-auto-redeem"
              />
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Mitglied seit: {loyalty?.memberSince ? format(new Date(loyalty.memberSince), 'dd. MMMM yyyy', { locale: de }) : '-'}
              </p>
              {loyalty?.yearsAsMember && loyalty.yearsAsMember >= 1 && (
                <p className="text-sm text-muted-foreground">
                  {loyalty.yearsAsMember} {loyalty.yearsAsMember === 1 ? 'Jahr' : 'Jahre'} Mitglied
                </p>
              )}
            </div>

            {(loyalty?.birthdayBonusAvailable || loyalty?.anniversaryBonusAvailable) && (
              <div className="space-y-2 pt-2">
                {loyalty?.birthdayBonusAvailable && (
                  <Button 
                    onClick={claimBirthdayBonus}
                    disabled={isSaving}
                    className="w-full"
                    data-testid="button-claim-birthday"
                  >
                    <Cake className="w-4 h-4 mr-2" />
                    Geburtstags-Bonus abholen (500 Punkte)
                  </Button>
                )}
                {loyalty?.anniversaryBonusAvailable && (
                  <Button 
                    onClick={claimAnniversaryBonus}
                    disabled={isSaving}
                    className="w-full"
                    variant="outline"
                    data-testid="button-claim-anniversary"
                  >
                    <PartyPopper className="w-4 h-4 mr-2" />
                    Jubiläums-Bonus abholen (200 Punkte)
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Punkte-Verlauf
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!loyalty?.transactions?.length ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Punkte-Transaktionen vorhanden
            </p>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {loyalty.transactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.points > 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'
                      }`}>
                        {tx.type === 'purchase' && <ShoppingBag className="w-4 h-4" />}
                        {tx.type === 'redemption' && <Gift className="w-4 h-4" />}
                        {tx.type === 'birthday' && <Cake className="w-4 h-4" />}
                        {tx.type === 'anniversary' && <PartyPopper className="w-4 h-4" />}
                        {tx.type === 'bonus' && <Sparkles className="w-4 h-4" />}
                        {tx.type === 'adjustment' && <TrendingUp className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || tx.type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(tx.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                        </p>
                      </div>
                    </div>
                    <span className={`font-bold ${tx.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.points > 0 ? '+' : ''}{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Treuestufen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg text-center ${tierKey === 'bronze' ? 'ring-2 ring-primary' : ''}`}>
              <Badge className={TIER_COLORS.bronze}>Bronze</Badge>
              <p className="text-sm mt-2">0€ - 49€</p>
              <p className="text-xs text-muted-foreground">Kein Rabatt</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${tierKey === 'silver' ? 'ring-2 ring-primary' : ''}`}>
              <Badge className={TIER_COLORS.silver}>Silber</Badge>
              <p className="text-sm mt-2">50€ - 199€</p>
              <p className="text-xs text-muted-foreground">5% Rabatt</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${tierKey === 'gold' ? 'ring-2 ring-primary' : ''}`}>
              <Badge className={TIER_COLORS.gold}>Gold</Badge>
              <p className="text-sm mt-2">200€ - 499€</p>
              <p className="text-xs text-muted-foreground">10% Rabatt</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${tierKey === 'platinum' ? 'ring-2 ring-primary' : ''}`}>
              <Badge className={TIER_COLORS.platinum}>Platin</Badge>
              <p className="text-sm mt-2">500€+</p>
              <p className="text-xs text-muted-foreground">15% Rabatt</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Ihre aktuelle Gesamtausgabe: {(loyalty?.totalSpent || 0).toFixed(2)}€
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
