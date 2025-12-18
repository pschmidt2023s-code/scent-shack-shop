import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StockNotificationButtonProps {
  productId: string;
  variantId: string;
  inStock: boolean;
}

export function StockNotificationButton({
  productId,
  variantId,
  inStock,
}: StockNotificationButtonProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  if (inStock) return null;

  const handleSubscribe = async () => {
    if (!email) {
      toast.error('Bitte E-Mail-Adresse eingeben');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/stock-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: user?.id,
          email,
          productId,
          variantId,
        })
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.error?.includes('already')) {
          toast.info('Du hast bereits eine Benachrichtigung für dieses Produkt aktiviert.');
          setOpen(false);
          return;
        }
        throw new Error(data.error || 'Fehler beim Aktivieren');
      }

      setSubscribed(true);
      toast.success('Benachrichtigung aktiviert! Wir informieren dich, wenn das Produkt wieder verfügbar ist.');
      
      setTimeout(() => {
        setOpen(false);
        setSubscribed(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error subscribing to stock notification:', error);
      toast.error(error.message || 'Fehler beim Aktivieren der Benachrichtigung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full" data-testid="button-notify-stock">
          <Bell className="w-4 h-4" />
          Benachrichtigen wenn verfügbar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verfügbarkeitsbenachrichtigung</DialogTitle>
          <DialogDescription>
            Wir informieren dich per E-Mail, sobald dieses Produkt wieder auf Lager ist.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input
              id="email"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || subscribed}
              data-testid="input-notify-email"
            />
          </div>

          {subscribed ? (
            <Button className="w-full gap-2" disabled data-testid="button-subscribed">
              <Check className="w-4 h-4" />
              Benachrichtigung aktiviert
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={loading || !email}
              className="w-full gap-2"
              data-testid="button-subscribe-notify"
            >
              <Bell className="w-4 h-4" />
              {loading ? 'Wird aktiviert...' : 'Benachrichtigung aktivieren'}
            </Button>
          )}

          <p className="text-xs text-muted-foreground text-center">
            Deine E-Mail wird nur für diese Benachrichtigung verwendet.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
