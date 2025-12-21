import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface SubscriptionButtonProps {
  variantId: string;
  variantName: string;
  price: number;
  isLoggedIn: boolean;
}

export function SubscriptionButton({ variantId, variantName, price, isLoggedIn }: SubscriptionButtonProps) {
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState('monthly');
  const [quantity, setQuantity] = useState('1');
  const queryClient = useQueryClient();

  const discountedPrice = price * 0.85;

  const createSubscription = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          variantId,
          frequency,
          quantity: parseInt(quantity),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Fehler beim Erstellen des Abos');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast.success('Abo erfolgreich erstellt!', {
        description: 'Sie erhalten Ihre erste Lieferung in Kürze.',
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error('Abo konnte nicht erstellt werden', { 
        description: error.message || 'Bitte versuchen Sie es erneut.',
      });
    },
  });

  const getFrequencyLabel = (freq: string) => {
    switch (freq) {
      case 'monthly': return 'Monatlich';
      case 'bimonthly': return 'Alle 2 Monate';
      case 'quarterly': return 'Vierteljährlich';
      default: return freq;
    }
  };

  const getNextDelivery = (freq: string) => {
    const now = new Date();
    switch (freq) {
      case 'monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'bimonthly':
        now.setMonth(now.getMonth() + 2);
        break;
      case 'quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
    }
    return now.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  if (!isLoggedIn) {
    return (
      <Button 
        variant="outline" 
        onClick={() => toast.info('Bitte melden Sie sich an, um ein Abo abzuschließen.')}
        data-testid="button-subscription-login-required"
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Abo (15% sparen)
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" data-testid="button-subscription-open">
          <RefreshCw className="w-4 h-4 mr-2" />
          Abo (15% sparen)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Duft-Abo einrichten</DialogTitle>
          <DialogDescription>
            Sparen Sie 15% bei jeder Lieferung und verpassen Sie nie wieder Ihren Lieblingsduft.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{variantName}</span>
              <Badge variant="secondary">15% Rabatt</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through text-sm">{price.toFixed(2)} EUR</span>
              <span className="text-lg font-bold text-primary">{discountedPrice.toFixed(2)} EUR</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequency">Lieferfrequenz</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" data-testid="select-subscription-frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monatlich</SelectItem>
                <SelectItem value="bimonthly">Alle 2 Monate</SelectItem>
                <SelectItem value="quarterly">Vierteljährlich (alle 3 Monate)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Menge pro Lieferung</Label>
            <Select value={quantity} onValueChange={setQuantity}>
              <SelectTrigger id="quantity" data-testid="select-subscription-quantity">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Flakon</SelectItem>
                <SelectItem value="2">2 Flakons</SelectItem>
                <SelectItem value="3">3 Flakons</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Erste Lieferung: {getNextDelivery(frequency)}</p>
                <p className="text-muted-foreground">
                  Danach {getFrequencyLabel(frequency).toLowerCase()}. Jederzeit kündbar.
                </p>
              </div>
            </div>
          </div>

          <ul className="text-sm text-muted-foreground space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-3 h-3 text-primary" />
              15% Rabatt auf jede Lieferung
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3 h-3 text-primary" />
              Kostenloser Versand
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3 h-3 text-primary" />
              Jederzeit pausieren oder kündigen
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-3 h-3 text-primary" />
              Flexibel Frequenz ändern
            </li>
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
          <Button 
            onClick={() => createSubscription.mutate()}
            disabled={createSubscription.isPending}
            data-testid="button-subscription-confirm"
          >
            {createSubscription.isPending ? 'Wird erstellt...' : 'Abo starten'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
