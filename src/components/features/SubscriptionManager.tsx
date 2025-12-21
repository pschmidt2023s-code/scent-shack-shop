import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Package, Pause, Play, X, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Subscription {
  id: string;
  variantId: string;
  frequency: string;
  quantity: number;
  status: string;
  nextDeliveryDate: string;
  createdAt: string;
}

export function SubscriptionManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [newFrequency, setNewFrequency] = useState('');

  const { data: subscriptions = [], isLoading } = useQuery<Subscription[]>({
    queryKey: ['/api/subscriptions'],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subscription> }) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update subscription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast.success('Abo aktualisiert');
      setEditingId(null);
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Abos');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/subscriptions/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to cancel subscription');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast.success('Abo gekündigt');
      setCancelDialogOpen(false);
      setSelectedSubscription(null);
    },
    onError: () => {
      toast.error('Fehler beim Kündigen des Abos');
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Aktiv</Badge>;
      case 'paused':
        return <Badge variant="secondary">Pausiert</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Gekündigt</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'monthly':
        return 'Monatlich';
      case 'bimonthly':
        return 'Alle 2 Monate';
      case 'quarterly':
        return 'Vierteljährlich';
      default:
        return frequency;
    }
  };

  const handlePauseResume = (subscription: Subscription) => {
    const newStatus = subscription.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ id: subscription.id, data: { status: newStatus } });
  };

  const handleUpdateFrequency = (id: string) => {
    if (newFrequency) {
      updateMutation.mutate({ id, data: { frequency: newFrequency } });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4" />
            <div className="h-20 bg-muted rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-semibold mb-2">Keine aktiven Abos</h3>
          <p className="text-sm text-muted-foreground">
            Starte ein Duft-Abo und spare 15% bei jeder Lieferung.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-lg">Duft-Abo</CardTitle>
                {getStatusBadge(subscription.status)}
              </div>
              <CardDescription>
                Erstellt am {new Date(subscription.createdAt).toLocaleDateString('de-DE')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>
                    Nächste Lieferung: {new Date(subscription.nextDeliveryDate).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Package className="w-4 h-4 text-muted-foreground" />
                  <span>{subscription.quantity}x {getFrequencyLabel(subscription.frequency)}</span>
                </div>
              </div>

              {editingId === subscription.id ? (
                <div className="flex gap-2">
                  <Select value={newFrequency} onValueChange={setNewFrequency}>
                    <SelectTrigger className="flex-1" data-testid="select-frequency">
                      <SelectValue placeholder="Häufigkeit wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monatlich</SelectItem>
                      <SelectItem value="bimonthly">Alle 2 Monate</SelectItem>
                      <SelectItem value="quarterly">Vierteljährlich</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => handleUpdateFrequency(subscription.id)}
                    disabled={!newFrequency || updateMutation.isPending}
                    data-testid="button-save-frequency"
                  >
                    Speichern
                  </Button>
                  <Button variant="ghost" onClick={() => setEditingId(null)} data-testid="button-cancel-edit">
                    Abbrechen
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {subscription.status !== 'cancelled' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePauseResume(subscription)}
                        disabled={updateMutation.isPending}
                        className="gap-2"
                        data-testid="button-pause-resume"
                      >
                        {subscription.status === 'active' ? (
                          <>
                            <Pause className="w-4 h-4" /> Pausieren
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" /> Fortsetzen
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(subscription.id);
                          setNewFrequency(subscription.frequency);
                        }}
                        className="gap-2"
                        data-testid="button-edit-frequency"
                      >
                        <Edit className="w-4 h-4" /> Häufigkeit ändern
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedSubscription(subscription);
                          setCancelDialogOpen(true);
                        }}
                        className="gap-2 text-destructive"
                        data-testid="button-cancel-subscription"
                      >
                        <X className="w-4 h-4" /> Kündigen
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Abo kündigen?</DialogTitle>
            <DialogDescription>
              Bist du sicher, dass du dein Duft-Abo kündigen möchtest? Du verlierst damit den 15% Abo-Rabatt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} data-testid="button-keep-subscription">
              Abo behalten
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedSubscription && cancelMutation.mutate(selectedSubscription.id)}
              disabled={cancelMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelMutation.isPending ? 'Wird gekündigt...' : 'Ja, kündigen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
