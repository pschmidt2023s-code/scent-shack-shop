import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface StockNotification {
  id: string;
  email: string;
  productId: string;
  variantId: string;
  notified: boolean;
  createdAt: string;
}

export function StockNotificationManagement() {
  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stock-notifications', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data || []);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Fehler beim Laden');
    } finally {
      setLoading(false);
    }
  };

  const sendNotification = async (variantId: string) => {
    try {
      const response = await fetch('/api/admin/stock-notifications/send', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId }),
      });

      if (!response.ok) throw new Error('Failed to send');
      toast.success('Benachrichtigungen versendet');
      fetchNotifications();
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast.error('Fehler beim Versenden');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/stock-notifications/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to delete');
      toast.success('Benachrichtigung gelöscht');
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Fehler beim Löschen');
    }
  };

  const pending = notifications.filter((n) => !n.notified);
  const sent = notifications.filter((n) => n.notified);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Lagerbestandsbenachrichtigungen</h2>
        <p className="text-muted-foreground">
          Verwalte Benachrichtigungen für nicht vorrätige Produkte
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ausstehend</p>
              <p className="text-2xl font-bold">{pending.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Versendet</p>
              <p className="text-2xl font-bold">{sent.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{notifications.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Ausstehende Benachrichtigungen</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>E-Mail</TableHead>
              <TableHead>Produkt ID</TableHead>
              <TableHead>Variante ID</TableHead>
              <TableHead>Erstellt</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pending.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Keine ausstehenden Benachrichtigungen
                </TableCell>
              </TableRow>
            ) : (
              pending.slice(0, 20).map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell className="font-medium">{notification.email}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {notification.productId?.substring(0, 8)}...
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {notification.variantId?.substring(0, 8)}...
                  </TableCell>
                  <TableCell>
                    {new Date(notification.createdAt).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">Ausstehend</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => sendNotification(notification.variantId)}
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
