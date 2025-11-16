import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ShoppingCart, Users, Package, Euro } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCard {
  title: string;
  value: string;
  change: number;
  icon: any;
  trend: 'up' | 'down';
}

const stats: StatCard[] = [
  {
    title: 'Gesamtumsatz',
    value: '€24,563',
    change: 12.5,
    icon: Euro,
    trend: 'up'
  },
  {
    title: 'Bestellungen',
    value: '234',
    change: 8.2,
    icon: ShoppingCart,
    trend: 'up'
  },
  {
    title: 'Neue Kunden',
    value: '45',
    change: -2.4,
    icon: Users,
    trend: 'down'
  },
  {
    title: 'Lagerbestand',
    value: '1,234',
    change: 5.1,
    icon: Package,
    trend: 'up'
  }
];

export function QuickStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === 'up' ? TrendingUp : TrendingDown;
        
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 text-xs mt-1">
                <TrendIcon className={cn(
                  "h-3 w-3",
                  stat.trend === 'up' ? "text-green-500" : "text-red-500"
                )} />
                <span className={cn(
                  "font-medium",
                  stat.trend === 'up' ? "text-green-500" : "text-red-500"
                )}>
                  {stat.change > 0 ? '+' : ''}{stat.change}%
                </span>
                <span className="text-muted-foreground">vs. letzter Monat</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
