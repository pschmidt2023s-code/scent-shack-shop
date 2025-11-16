import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Package, Heart, Gift, TrendingUp } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'order' | 'wishlist' | 'promo' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'order',
    title: 'Bestellung versendet',
    message: 'Ihre Bestellung #12345 wurde versendet und ist unterwegs.',
    time: 'vor 2 Stunden',
    read: false,
    icon: Package
  },
  {
    id: '2',
    type: 'wishlist',
    title: 'Favorit wieder verfügbar',
    message: 'Tom Ford Black Orchid ist wieder auf Lager!',
    time: 'vor 5 Stunden',
    read: false,
    icon: Heart
  },
  {
    id: '3',
    type: 'promo',
    title: 'Exklusives Angebot',
    message: '20% Rabatt auf alle Dior Düfte - nur heute!',
    time: 'vor 1 Tag',
    read: true,
    icon: Gift
  }
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Benachrichtigungen</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
              >
                Alle als gelesen
              </Button>
            )}
          </div>
          <SheetDescription>
            Sie haben {unreadCount} ungelesene Benachrichtigung{unreadCount !== 1 && 'en'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-150px)] mt-6">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Keine Benachrichtigungen</p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all cursor-pointer group",
                      notification.read
                        ? "bg-card hover:bg-accent/50"
                        : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                        notification.read ? "bg-muted" : "bg-primary/10"
                      )}>
                        <Icon className={cn(
                          "w-5 h-5",
                          notification.read ? "text-muted-foreground" : "text-primary"
                        )} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className={cn(
                            "font-semibold text-sm",
                            !notification.read && "text-primary"
                          )}>
                            {notification.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
