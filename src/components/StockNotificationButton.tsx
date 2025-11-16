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
import { supabase } from '@/integrations/supabase/client';
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
      const { error } = await supabase.from('stock_notifications').insert({
        user_id: user?.id,
        email,
        product_id: productId,
        variant_id: variantId,
      });

      if (error) throw error;

      setSubscribed(true);
      toast.success('Benachrichtigung aktiviert! Wir informieren dich, wenn das Produkt wieder verfügbar ist.');
      
      setTimeout(() => {
        setOpen(false);
        setSubscribed(false);
      }, 2000);
    } catch (error: any) {
      console.error('Error subscribing to stock notification:', error);
      
      if (error.code === '23505') {
        toast.info('Du hast bereits eine Benachrichtigung für dieses Produkt aktiviert.');
      } else {
        toast.error('Fehler beim Aktivieren der Benachrichtigung');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 w-full">
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
            />
          </div>

          {subscribed ? (
            <Button className="w-full gap-2" disabled>
              <Check className="w-4 h-4" />
              Benachrichtigung aktiviert
            </Button>
          ) : (
            <Button
              onClick={handleSubscribe}
              disabled={loading || !email}
              className="w-full gap-2"
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
