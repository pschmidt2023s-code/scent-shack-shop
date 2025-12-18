import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, Package, Heart, Gift, TrendingUp, Truck, CheckCircle } from 'lucide-react';
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
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'order' | 'wishlist' | 'promo' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon: any;
}

const getNotificationIcon = (type: string, status?: string) => {
  if (type === 'order') {
    if (status === 'shipped' || status === 'processing') return Truck;
    if (status === 'completed') return CheckCircle;
    return Package;
  }
  if (type === 'wishlist') return Heart;
  if (type === 'promo') return Gift;
  return Bell;
};

const formatTimeAgo = (date: string) => {
  const now = new Date();
  const then = new Date(date);
  const diffInMs = now.getTime() - then.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 60) return `vor ${diffInMinutes} Minute${diffInMinutes !== 1 ? 'n' : ''}`;
  if (diffInHours < 24) return `vor ${diffInHours} Stunde${diffInHours !== 1 ? 'n' : ''}`;
  return `vor ${diffInDays} Tag${diffInDays !== 1 ? 'en' : ''}`;
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/orders', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const orders = await response.json();

      const orderNotifications: Notification[] = (orders || []).slice(0, 10).map((order: any) => {
        let title = 'Neue Bestellung';
        let message = `Ihre Bestellung ${order.orderNumber} wurde aufgegeben.`;
        let icon = Package;

        if (order.status === 'processing') {
          title = 'Bestellung wird bearbeitet';
          message = `Ihre Bestellung ${order.orderNumber} wird bearbeitet.`;
          icon = Package;
        } else if (order.status === 'shipped') {
          title = 'Bestellung versendet';
          message = `Ihre Bestellung ${order.orderNumber} wurde versendet und ist unterwegs.`;
          icon = Truck;
        } else if (order.status === 'completed') {
          title = 'Bestellung zugestellt';
          message = `Ihre Bestellung ${order.orderNumber} wurde zugestellt.`;
          icon = CheckCircle;
        }

        return {
          id: `order-${order.id}`,
          type: 'order' as const,
          title,
          message,
          time: formatTimeAgo(order.createdAt),
          read: false,
          icon
        };
      });

      setNotifications(orderNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-notifications">
          <Bell className="h-5 w-5" />
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
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="border-b pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Benachrichtigungen
            </SheetTitle>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={markAllAsRead}
                className="text-xs"
              >
                Alle gelesen
              </Button>
            )}
          </div>
          <SheetDescription>
            Ihre aktuellen Benachrichtigungen
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine Benachrichtigungen</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 rounded-lg cursor-pointer transition-colors",
                      notification.read 
                        ? "bg-muted/50" 
                        : "bg-primary/5 border border-primary/10"
                    )}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        notification.type === 'order' ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300" :
                        notification.type === 'wishlist' ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300" :
                        notification.type === 'promo' ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300" :
                        "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{notification.title}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
