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
import { supabase } from '@/integrations/supabase/client';
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
      // Load order notifications
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      const orderNotifications: Notification[] = (orders || []).map((order) => {
        let title = 'Neue Bestellung';
        let message = `Ihre Bestellung ${order.order_number} wurde aufgegeben.`;
        let icon = Package;

        if (order.status === 'processing') {
          title = 'Bestellung wird bearbeitet';
          message = `Ihre Bestellung ${order.order_number} wird bearbeitet.`;
          icon = Package;
        } else if (order.status === 'shipped') {
          title = 'Bestellung versendet';
          message = `Ihre Bestellung ${order.order_number} wurde versendet und ist unterwegs.`;
          icon = Truck;
        } else if (order.status === 'completed') {
          title = 'Bestellung zugestellt';
          message = `Ihre Bestellung ${order.order_number} wurde zugestellt.`;
          icon = CheckCircle;
        }

        return {
          id: `order-${order.id}`,
          type: 'order' as const,
          title,
          message,
          time: formatTimeAgo(order.created_at),
          read: false,
          icon
        };
      });

      // Load stock notifications
      const { data: stockNotifs, error: stockError } = await supabase
        .from('stock_notifications')
        .select(`
          *,
          product_variants!inner(name, in_stock)
        `)
        .eq('user_id', user.id)
        .eq('notified', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (stockError) throw stockError;

      const stockNotifications: Notification[] = (stockNotifs || []).map((notif: any) => ({
        id: `stock-${notif.id}`,
        type: 'wishlist' as const,
        title: 'Artikel wieder verfügbar',
        message: `${notif.product_variants.name} ist wieder auf Lager!`,
        time: formatTimeAgo(notif.created_at),
        read: false,
        icon: Heart
      }));

      setNotifications([...orderNotifications, ...stockNotifications]);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

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
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
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
