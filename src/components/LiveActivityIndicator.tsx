import { useState, useEffect } from 'react';
import { Eye, ShoppingCart, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityEvent {
  id: string;
  type: 'view' | 'purchase' | 'favorite';
  message: string;
  icon: any;
}

const mockEvents: ActivityEvent[] = [
  {
    id: '1',
    type: 'purchase',
    message: 'Maria aus Berlin hat gerade Tom Ford Black Orchid gekauft',
    icon: ShoppingCart
  },
  {
    id: '2',
    type: 'view',
    message: '12 Personen schauen sich gerade Dior Sauvage an',
    icon: Eye
  },
  {
    id: '3',
    type: 'favorite',
    message: 'Stefan aus München hat Chanel Bleu zu den Favoriten hinzugefügt',
    icon: Heart
  },
  {
    id: '4',
    type: 'purchase',
    message: 'Lisa aus Hamburg hat gerade 2 Produkte gekauft',
    icon: ShoppingCart
  }
];

export function LiveActivityIndicator() {
  const [currentEvent, setCurrentEvent] = useState<ActivityEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let eventIndex = 0;
    
    const showNextEvent = () => {
      setCurrentEvent(mockEvents[eventIndex]);
      setIsVisible(true);
      
      // Hide after 4 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 4000);
      
      eventIndex = (eventIndex + 1) % mockEvents.length;
    };

    // Show first event after 2 seconds
    const initialTimeout = setTimeout(showNextEvent, 2000);
    
    // Then show new event every 10 seconds
    const interval = setInterval(showNextEvent, 10000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  if (!currentEvent) return null;

  const Icon = currentEvent.icon;

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-24 left-4 md:bottom-6 md:left-6 z-40 max-w-sm animate-slide-up">
          <div className="glass-card p-4 rounded-2xl shadow-2xl border border-border/20">
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                currentEvent.type === 'purchase' && "bg-green-500/10",
                currentEvent.type === 'view' && "bg-blue-500/10",
                currentEvent.type === 'favorite' && "bg-pink-500/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  currentEvent.type === 'purchase' && "text-green-500",
                  currentEvent.type === 'view' && "text-blue-500",
                  currentEvent.type === 'favorite' && "text-pink-500"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">
                  {currentEvent.message}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
