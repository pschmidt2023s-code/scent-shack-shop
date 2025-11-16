import { Award, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useLoyaltyPoints } from '@/hooks/useLoyaltyPoints';
import { Skeleton } from '@/components/ui/skeleton';

export function LoyaltyPointsCard() {
  const { loyalty, loading, getTierInfo } = useLoyaltyPoints();

  if (loading) {
    return <Skeleton className="h-48 w-full" />;
  }

  if (!loyalty) return null;

  const tierInfo = getTierInfo();

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/10 via-background to-background border-primary/20">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Treuepunkte</h3>
            <Badge 
              variant="secondary" 
              style={{ backgroundColor: tierInfo?.current.color + '20', color: tierInfo?.current.color }}
            >
              {tierInfo?.current.name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Sammle Punkte bei jedem Einkauf
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-primary">{loyalty.points}</div>
          <p className="text-xs text-muted-foreground">Verfügbar</p>
        </div>
      </div>

      {tierInfo?.next && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Bis {tierInfo.next.name}
            </span>
            <span className="font-medium">
              {tierInfo.next.minPoints - loyalty.lifetimePoints} Punkte
            </span>
          </div>
          <Progress value={tierInfo.progress} className="h-2" />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <Sparkles className="w-5 h-5 mx-auto mb-1 text-yellow-600" />
          <div className="text-xs text-muted-foreground">Gesamt</div>
          <div className="font-semibold">{loyalty.lifetimePoints}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <Gift className="w-5 h-5 mx-auto mb-1 text-green-600" />
          <div className="text-xs text-muted-foreground">Einlösbar</div>
          <div className="font-semibold">€{(loyalty.points / 100).toFixed(2)}</div>
        </div>
        <div className="text-center p-3 rounded-lg bg-muted/50">
          <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-600" />
          <div className="text-xs text-muted-foreground">Rate</div>
          <div className="font-semibold">5%</div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-primary/5 rounded-lg text-sm">
        <p className="text-muted-foreground">
          💡 <strong>Tipp:</strong> Sammle bei jedem Euro 5 Punkte. 100 Punkte = 1€ Rabatt!
        </p>
      </div>
    </Card>
  );
}
