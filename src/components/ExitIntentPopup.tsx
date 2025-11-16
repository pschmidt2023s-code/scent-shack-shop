import { useState, useEffect } from 'react';
import { X, Gift } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent } from './ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function ExitIntentPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem('exitIntentShown');
    if (shown) {
      setHasShown(true);
      return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger if mouse is leaving from top of page
      if (e.clientY <= 0 && !hasShown && !isOpen) {
        setIsOpen(true);
        setHasShown(true);
        sessionStorage.setItem('exitIntentShown', 'true');
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [hasShown, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email, preferences: { promotions: true } }]);

      if (error) throw error;

      toast.success('🎉 Willkommen! Ihr 10% Rabattcode: WELCOME10');
      setIsOpen(false);
      setEmail('');
    } catch (error) {
      toast.error('Fehler beim Anmelden. Bitte versuchen Sie es später erneut.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden p-0">
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="relative">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/20 via-transparent to-luxury-gold/20" />
          
          <div className="relative p-6 sm:p-8 space-y-4">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-luxury-gold/20 flex items-center justify-center">
                <Gift className="h-8 w-8 text-luxury-gold animate-bounce" />
              </div>
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Warte! 🎁
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
              />
              <Button 
                type="submit" 
                className="w-full bg-luxury-gold hover:bg-luxury-gold-light text-luxury-black font-semibold"
                size="lg"
              >
                10% Rabattcode erhalten
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
