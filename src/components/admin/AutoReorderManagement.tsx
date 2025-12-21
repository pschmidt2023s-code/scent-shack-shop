import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Users, Euro, TrendingUp, Pause, Play, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Subscription {
  id: string;
  userId: string;
  variantId: string;
  frequency: string;
  quantity: number;
  status: string;
  nextDeliveryDate: string;
  createdAt: string;
}

interface User {
  id: string;
  email: string;
  fullName: string | null;
}

interface Variant {
  id: string;
  name: string;
  price: string;
}

export function AutoReorderManagement() {
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['/api/admin/subscriptions'],
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: products = [] } = useQuery<{ variants: Variant[] }[]>({
    queryKey: ['/api/products'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subscription> }) => {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Fehler beim Aktualisieren');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      toast.success('Abo aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Abos');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Fehler beim Kündigen');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/subscriptions'] });
      toast.success('Abo gekündigt');
    },
    onError: () => {
      toast.error('Fehler beim Kündigen des Abos');
    },
  });

  const getUserEmail = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user?.email || userId.substring(0, 8) + '...';
  };

  const getVariantInfo = (variantId: string): { name: string; price: number } => {
    for (const product of products) {
      const variant = product.variants?.find(v => v.id === variantId);
      if (variant) {
        return { name: variant.name, price: parseFloat(variant.price) || 0 };
      }
    }
    return { name: 'Unbekannt', price: 0 };
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly': return 'Monatlich';
      case 'bimonthly': return 'Alle 2 Monate';
      case 'quarterly': return 'Vierteljährlich';
      default: return frequency;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">Aktiv</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausiert</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handlePauseResume = (subscription: Subscription) => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ id: subscription.id, data: { status: newStatus } });
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const uniqueUsers = new Set(subscriptions.map(s => s.userId)).size;
  
  const estimatedMonthlyRevenue = activeSubscriptions.reduce((sum, sub) => {
    const variantInfo = getVariantInfo(sub.variantId);
    const discountedPrice = variantInfo.price * 0.85;
    let monthlyMultiplier = 1;
    if (sub.frequency === 'bimonthly') monthlyMultiplier = 0.5;
    if (sub.frequency === 'quarterly') monthlyMultiplier = 0.33;
    return sum + (discountedPrice * sub.quantity * monthlyMultiplier);
  }, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Abo-Verwaltung</h2>
        <p className="text-muted-foreground">
          Verwalte Kunden-Abonnements und Einstellungen
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Aktive Abos</p>
              <p className="text-2xl font-bold" data-testid="text-active-subscriptions">{activeSubscriptions.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt Abonnenten</p>
              <p className="text-2xl font-bold" data-testid="text-total-subscribers">{uniqueUsers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Euro className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monatl. Umsatz (Est.)</p>
              <p className="text-2xl font-bold" data-testid="text-monthly-revenue">{estimatedMonthlyRevenue.toFixed(2)} EUR</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Abo-Rabatt</p>
              <p className="text-2xl font-bold">15%</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Alle Abonnements ({subscriptions.length})</h3>
        </div>
        {subscriptions.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <RefreshCw className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Abonnements vorhanden.</p>
            <p className="text-sm mt-1">Kunden können auf der Produktseite ein Abo abschließen.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kunde</TableHead>
                <TableHead>Produkt</TableHead>
                <TableHead>Frequenz</TableHead>
                <TableHead>Menge</TableHead>
                <TableHead>Nächste Lieferung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.map((sub) => {
                const variantInfo = getVariantInfo(sub.variantId);
                return (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      {getUserEmail(sub.userId)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{variantInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{(variantInfo.price * 0.85).toFixed(2)} EUR</p>
                      </div>
                    </TableCell>
                    <TableCell>{getFrequencyLabel(sub.frequency)}</TableCell>
                    <TableCell>{sub.quantity}x</TableCell>
                    <TableCell>
                      {sub.nextDeliveryDate 
                        ? new Date(sub.nextDeliveryDate).toLocaleDateString('de-DE')
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {sub.status !== 'cancelled' && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handlePauseResume(sub)}
                            disabled={updateMutation.isPending}
                            title={sub.status === 'active' ? 'Pausieren' : 'Fortsetzen'}
                            data-testid={`button-toggle-subscription-${sub.id}`}
                          >
                            {sub.status === 'active' ? (
                              <Pause className="w-4 h-4" />
                            ) : (
                              <Play className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        {sub.status !== 'cancelled' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="text-destructive"
                                title="Kündigen"
                                data-testid={`button-cancel-subscription-${sub.id}`}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Abo kündigen?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Möchten Sie dieses Abo wirklich kündigen? Der Kunde wird keine weiteren automatischen Lieferungen erhalten.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => cancelMutation.mutate(sub.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Kündigen
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
