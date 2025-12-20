import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, DollarSign, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AutoReorderSub {
  id: string;
  user_id: string;
  product_id: string;
  variant_id: string;
  frequency_days: number;
  next_order_date: string;
  is_active: boolean;
}

export function AutoReorderManagement() {
  const [subscriptions, setSubscriptions] = useState<AutoReorderSub[]>([]);
  const [loading, setLoading] = useState(true);
  const [discountPercentage, setDiscountPercentage] = useState(5);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Feature not yet implemented - using empty data
      setSubscriptions([]);
      setDiscountPercentage(5);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const updateDiscount = async () => {
    toast.success('Rabatt aktualisiert');
  };

  const activeSubscriptions = subscriptions.filter((s) => s.is_active);
  const totalRevenue = activeSubscriptions.length * 15; // Estimate

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Auto-Nachbestellungs-Verwaltung</h2>
        <p className="text-muted-foreground">
          Verwalte automatische Nachbestellungen und Einstellungen
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Abos</p>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Abonnenten</p>
              <p className="text-2xl font-bold">
                {new Set(subscriptions.map((s) => s.user_id)).size}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monatl. Umsatz (Est.)</p>
              <p className="text-2xl font-bold">€{totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktueller Rabatt</p>
              <p className="text-2xl font-bold">{discountPercentage}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Rabatt-Einstellungen</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <Label>Rabatt für Auto-Nachbestellungen (%)</Label>
            <Input
              type="number"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(parseFloat(e.target.value))}
              min="0"
              max="100"
              step="0.5"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Dieser Rabatt wird auf alle Auto-Nachbestellungen angewendet
            </p>
          </div>
          <Button onClick={updateDiscount}>Speichern</Button>
        </div>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Aktive Abonnements</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kunde</TableHead>
              <TableHead>Frequenz</TableHead>
              <TableHead>Nächste Bestellung</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.slice(0, 10).map((sub) => (
              <TableRow key={sub.id}>
                <TableCell className="font-medium">
                  {sub.user_id.substring(0, 8)}...
                </TableCell>
                <TableCell>Alle {sub.frequency_days} Tage</TableCell>
                <TableCell>
                  {new Date(sub.next_order_date).toLocaleDateString('de-DE')}
                </TableCell>
                <TableCell>
                  {sub.is_active ? (
                    <Badge className="bg-green-100 text-green-700">Aktiv</Badge>
                  ) : (
                    <Badge variant="secondary">Pausiert</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
