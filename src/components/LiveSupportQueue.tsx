import { useState, useEffect } from 'react';
import { MessageCircle, Users, Clock } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

export function LiveSupportQueue() {
  const { toast } = useToast();
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(2);
  const [isInQueue, setIsInQueue] = useState(false);

  useEffect(() => {
    if (isInQueue && queuePosition) {
      const interval = setInterval(() => {
        setQueuePosition(prev => {
          if (prev && prev > 1) {
            return prev - 1;
          } else if (prev === 1) {
            setIsInQueue(false);
            toast({
              title: "Sie sind dran!",
              description: "Ein Support-Mitarbeiter ist jetzt für Sie verfügbar.",
            });
            openWhatsAppSupport();
            return null;
          }
          return prev;
        });
      }, 15000); // Simulate queue movement every 15 seconds

      return () => clearInterval(interval);
    }
  }, [isInQueue, queuePosition]);

  const joinQueue = () => {
    const randomPosition = Math.floor(Math.random() * 5) + 1;
    setQueuePosition(randomPosition);
    setIsInQueue(true);
    setEstimatedWaitTime(randomPosition * 2);
    
    toast({
      title: "In Warteschleife eingereiht",
      description: `Position ${randomPosition} - Geschätzte Wartezeit: ~${randomPosition * 2} Min`,
    });
  };

  const openWhatsAppSupport = () => {
    const phoneNumber = '4915569057649';
    const message = `Hallo! Ich brauche Support.`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Card className="p-6 max-w-md mx-auto">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-full">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Live Support</h3>
            <p className="text-sm text-muted-foreground">
              Schnelle Antwortzeit
            </p>
          </div>
        </div>

        {!isInQueue ? (
          <>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Ø Wartezeit</p>
                  <p className="font-semibold">~2 Min</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="font-semibold text-green-600">●  Online</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={joinQueue}
              className="w-full"
              size="lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Support kontaktieren
            </Button>

            <Button 
              onClick={openWhatsAppSupport}
              variant="outline"
              className="w-full"
            >
              Direkt zu WhatsApp
            </Button>
          </>
        ) : (
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-3">
                <span className="text-2xl font-bold text-primary">{queuePosition}</span>
              </div>
              <p className="font-semibold">Position in der Warteschleife</p>
              <p className="text-sm text-muted-foreground mt-1">
                Geschätzte Wartezeit: ~{estimatedWaitTime} Min
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium">Support-Team benachrichtigt</p>
              </div>
              <p className="text-xs text-muted-foreground">
                Sie werden automatisch verbunden, sobald ein Mitarbeiter verfügbar ist.
              </p>
            </div>

            <Button 
              onClick={() => {
                setIsInQueue(false);
                setQueuePosition(null);
                toast({
                  title: "Warteschleife verlassen",
                  description: "Sie können jederzeit erneut Support anfordern.",
                });
              }}
              variant="outline"
              className="w-full"
            >
              Warteschleife verlassen
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground text-center">
            💬 Oder schreiben Sie uns direkt auf WhatsApp
          </p>
          <p className="text-xs text-center font-mono mt-1">
            +49 155 69057649
          </p>
        </div>
      </div>
    </Card>
  );
}
