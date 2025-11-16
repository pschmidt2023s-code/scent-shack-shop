import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function PushNotificationPrompt() {
  const [show, setShow] = useState(false);
  const { permission, requestPermission, isSupported } = usePushNotifications();

  useEffect(() => {
    // Show prompt after 10 seconds if not already asked
    const hasAsked = localStorage.getItem('push_prompt_shown');
    
    if (!hasAsked && isSupported && permission === 'default') {
      const timer = setTimeout(() => {
        setShow(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [permission, isSupported]);

  const handleAccept = async () => {
    await requestPermission();
    localStorage.setItem('push_prompt_shown', 'true');
    setShow(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('push_prompt_shown', 'true');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-6 z-50 max-w-sm animate-slide-in-left">
      <Card className="p-4 shadow-2xl border-2 border-primary/20 bg-card/95 backdrop-blur">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Benachrichtigungen aktivieren?</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Erhalte Updates zu neuen Produkten, Angeboten und deinen Bestellungen.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleAccept} size="sm" className="flex-1">
                Aktivieren
              </Button>
              <Button onClick={handleDismiss} size="sm" variant="ghost">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
