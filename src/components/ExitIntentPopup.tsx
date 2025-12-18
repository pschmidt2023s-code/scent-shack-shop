import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent } from './ui/dialog';
import { toast } from 'sonner';

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const shown = sessionStorage.getItem('exitIntentShown');
      if (shown) {
        setHasShown(true);
        return;
      }

      const handleMouseLeave = (e: MouseEvent) => {
        if (e.clientY <= 0 && !hasShown && !isOpen) {
          setIsOpen(true);
          setHasShown(true);
          sessionStorage.setItem('exitIntentShown', 'true');
        }
      };

      document.addEventListener('mouseleave', handleMouseLeave);
      return () => document.removeEventListener('mouseleave', handleMouseLeave);
    }, 1000);

    return () => clearTimeout(timer);
  }, [hasShown, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, preferences: { promotions: true } })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Fehler beim Anmelden');
      }

      toast.success('Willkommen! Ihr 10% Rabattcode: WELCOME10');
      setIsOpen(false);
      setEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Fehler beim Anmelden. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Schließen"
          data-testid="button-close-popup"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 via-transparent to-luxury-gold/20" />
          
          <div className="relative p-6 sm:p-8 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                <Gift className="h-8 w-8 text-luxury-gold animate-bounce" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Warte!
              </h2>
              <p className="text-lg font-semibold text-luxury-gold">
                Sichern Sie sich 10% Rabatt
              </p>
              <p className="text-sm text-muted-foreground">
                Melden Sie sich für unseren Newsletter an und erhalten Sie exklusive Angebote
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-center"
                data-testid="input-exit-email"
              />
              <Button 
                type="submit" 
                className="w-full bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-semibold"
                size="lg"
                disabled={loading}
                data-testid="button-exit-submit"
              >
                {loading ? 'Wird angemeldet...' : '10% Rabattcode erhalten'}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Keine Sorge, wir senden nur relevante Inhalte. Jederzeit abmeldbar.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
