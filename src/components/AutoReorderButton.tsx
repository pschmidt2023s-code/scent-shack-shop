import { useState } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAutoReorder } from '@/hooks/useAutoReorder';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AutoReorderButtonProps {
  productId: string;
  variantId: string;
}

export function AutoReorderButton({ productId, variantId }: AutoReorderButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createSubscription } = useAutoReorder();
  const [open, setOpen] = useState(false);
  const [frequency, setFrequency] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    await createSubscription(productId, variantId, parseInt(frequency));
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Auto-Nachbestellung
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Auto-Nachbestellung einrichten
          </DialogTitle>
          <DialogDescription>
            Erhalte dieses Produkt automatisch in regelmäßigen Abständen
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Lieferintervall</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14">Alle 2 Wochen</SelectItem>
                <SelectItem value="30">Jeden Monat</SelectItem>
                <SelectItem value="60">Alle 2 Monate</SelectItem>
                <SelectItem value="90">Alle 3 Monate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium">Nächste Lieferung:</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {new Date(Date.now() + parseInt(frequency) * 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Jederzeit änderbar oder kündbar</p>
            <p>✓ 5% Rabatt auf jede Auto-Bestellung</p>
            <p>✓ Kostenloser Versand</p>
          </div>

          <Button onClick={handleSubscribe} disabled={loading} className="w-full gap-2">
            <RefreshCw className="w-4 h-4" />
            {loading ? 'Wird aktiviert...' : 'Auto-Nachbestellung aktivieren'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
