import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Send, 
  Users, 
  Trash2
} from 'lucide-react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  preferences: any;
}

export default function NewsletterManagement() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newNewsletter, setNewNewsletter] = useState({
    subject: '',
    content: ''
  });

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/newsletter', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load subscribers');
      }

      const data = await response.json();
      setSubscribers(data || []);
    } catch (error) {
      console.error('Error loading newsletter data:', error);
      toast.error('Fehler beim Laden der Newsletter-Daten');
    } finally {
      setLoading(false);
    }
  };

  const sendNewsletter = async () => {
    if (!newNewsletter.subject.trim() || !newNewsletter.content.trim()) {
      toast.error('Betreff und Inhalt sind erforderlich');
      return;
    }

    setSending(true);
    try {
      toast.success('Newsletter wird gesendet...');
      setNewNewsletter({ subject: '', content: '' });
    } catch (error) {
      toast.error('Fehler beim Senden des Newsletters');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="text-center p-4">Lade Newsletter-Daten...</div>;
  }

  const activeSubscribers = subscribers.filter(s => s.isActive);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Abonnenten
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeSubscribers.length}</div>
            <p className="text-sm text-muted-foreground">Aktive Abonnenten</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Newsletter senden
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="subject">Betreff</Label>
              <Input
                id="subject"
                value={newNewsletter.subject}
                onChange={(e) => setNewNewsletter(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Newsletter Betreff..."
              />
            </div>
            <div>
              <Label htmlFor="content">Inhalt</Label>
              <Textarea
                id="content"
                value={newNewsletter.content}
                onChange={(e) => setNewNewsletter(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Newsletter Inhalt..."
                rows={4}
              />
            </div>
            <Button onClick={sendNewsletter} disabled={sending} className="w-full">
              <Send className="w-4 h-4 mr-2" />
              {sending ? 'Wird gesendet...' : 'Newsletter senden'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Abonnenten ({subscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {subscribers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Noch keine Newsletter-Abonnenten
            </p>
          ) : (
            <div className="space-y-2">
              {subscribers.map((subscriber) => (
                <div 
                  key={subscriber.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{subscriber.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Seit {new Date(subscriber.createdAt).toLocaleDateString('de-DE')}
                    </p>
                  </div>
                  <Badge variant={subscriber.isActive ? 'default' : 'secondary'}>
                    {subscriber.isActive ? 'Aktiv' : 'Inaktiv'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
