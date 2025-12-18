import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Copy, Share2, Users, Euro } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export function ReferralProgram() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReferralStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchReferralStats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Generate a simple referral code for the user
      const code = `REF${user.id.substring(0, 8).toUpperCase()}`;
      setStats({
        referralCode: code,
        totalReferrals: 0,
        totalEarnings: 0,
        pendingEarnings: 0,
      });
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    if (!stats) return;
    const link = `${window.location.origin}?ref=${stats.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Empfehlungslink kopiert!');
  };

  const shareReferralLink = async () => {
    if (!stats) return;
    const link = `${window.location.origin}?ref=${stats.referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ALDENAIR Empfehlung',
          text: 'Entdecke exklusive Parfüms bei ALDENAIR! Nutze meinen Link für einen Bonus.',
          url: link,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      copyReferralLink();
    }
  };

  if (!user) {
    return (
      <Card className="p-8 text-center">
        <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
        <h3 className="text-xl font-semibold mb-2">Empfehlungsprogramm</h3>
        <p className="text-muted-foreground mb-4">
          Melde dich an, um Freunde einzuladen und Prämien zu verdienen!
        </p>
        <Button>Jetzt anmelden</Button>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-8 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Empfehlungsprogramm</h2>
            <p className="text-muted-foreground">
              Teile deinen Link und verdiene 10% auf jede Empfehlung!
            </p>
          </div>
          <Gift className="w-12 h-12 text-primary" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Empfehlungen</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalReferrals}</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Verdient</span>
            </div>
            <p className="text-2xl font-bold">€{stats.totalEarnings.toFixed(2)}</p>
          </div>
          
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-5 h-5 text-orange-600" />
              <span className="text-sm text-muted-foreground">Ausstehend</span>
            </div>
            <p className="text-2xl font-bold">€{stats.pendingEarnings.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium">Dein Empfehlungslink</label>
          <div className="flex gap-2">
            <Input
              value={`${window.location.origin}?ref=${stats.referralCode}`}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyReferralLink} variant="outline" size="icon">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareReferralLink} variant="default" className="gap-2">
              <Share2 className="w-4 h-4" />
              Teilen
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>So funktioniert's:</strong> Teile deinen Link mit Freunden. 
            Wenn sie einkaufen, erhältst du 10% Provision auf jeden Einkauf!
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Warum empfehlen?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl">💰</span>
            </div>
            <h4 className="font-semibold">10% Provision</h4>
            <p className="text-sm text-muted-foreground">
              Verdiene auf jeden Einkauf deiner Empfehlungen
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl">🎁</span>
            </div>
            <h4 className="font-semibold">Bonus für Freunde</h4>
            <p className="text-sm text-muted-foreground">
              Deine Freunde erhalten einen Willkommensbonus
            </p>
          </div>
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <h4 className="font-semibold">Schnelle Auszahlung</h4>
            <p className="text-sm text-muted-foreground">
              Auszahlung ab 50€ direkt auf dein Konto
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
