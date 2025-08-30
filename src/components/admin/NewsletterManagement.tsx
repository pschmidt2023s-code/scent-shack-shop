import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Mail, 
  Send, 
  Users, 
  Eye, 
  Clock
} from 'lucide-react';

interface NewsletterSubscriber {
  id: string;
  email: string;
  is_active: boolean;
  subscribed_at: string;
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
      // Load subscribers
      const { data: subscribersData, error: subscribersError } = await supabase
        .from('newsletter_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('subscribed_at', { ascending: false });

      if (!subscribersError) {
        setSubscribers(subscribersData || []);
      }
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

    if (subscribers.length === 0) {
      toast.error('Keine aktiven Abonnenten gefunden');
      return;
    }

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-newsletter', {
        body: {
          subject: newNewsletter.subject,
          content: newNewsletter.content,
          subscribers: subscribers.map(s => s.email)
        }
      });

      if (error) throw error;

      toast.success(`Newsletter erfolgreich an ${subscribers.length} Abonnenten versendet!`);
      setNewNewsletter({ subject: '', content: '' });
    } catch (error: any) {
      console.error('Error sending newsletter:', error);
      toast.error('Fehler beim Versenden: ' + (error.message || 'Unbekannter Fehler'));
    } finally {
      setSending(false);
    }
  };

  const previewNewsletter = () => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <html>
          <head>
            <title>${newNewsletter.subject}</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #d4af37; color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #fff; padding: 30px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
              h1 { margin: 0; font-size: 32px; font-weight: bold; }
              .subtitle { margin: 10px 0 0 0; font-size: 16px; font-weight: 500; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>ALDENAIR</h1>
              <p class="subtitle">Premium Parfümerie</p>
            </div>
            <div class="content">
              <h2>${newNewsletter.subject}</h2>
              <div>${newNewsletter.content.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="footer">
              <p>ALDENAIR - Premium Parfümerie</p>
              <p>Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben.</p>
            </div>
          </body>
        </html>
      `);
      previewWindow.document.close();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Abonnenten</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bereit zum Versenden</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {newNewsletter.subject && newNewsletter.content ? 'Ja' : 'Nein'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Newsletter */}
      <Card>
        <CardHeader>
          <CardTitle>Newsletter erstellen und versenden</CardTitle>
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
              rows={10}
            />
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={sendNewsletter} 
              disabled={sending || !newNewsletter.subject.trim() || !newNewsletter.content.trim()}
            >
              {sending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Wird versendet...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  An {subscribers.length} Abonnenten senden
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={previewNewsletter}
              disabled={!newNewsletter.subject.trim() || !newNewsletter.content.trim()}
            >
              <Eye className="w-4 h-4 mr-2" />
              Vorschau
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers List */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnenten ({subscribers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subscribers.slice(0, 10).map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between p-2 border rounded">
                <span className="text-sm">{subscriber.email}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(subscriber.subscribed_at).toLocaleDateString('de-DE')}
                </span>
              </div>
            ))}
            
            {subscribers.length > 10 && (
              <p className="text-sm text-muted-foreground text-center pt-2">
                ... und {subscribers.length - 10} weitere
              </p>
            )}
            
            {subscribers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Keine Abonnenten gefunden.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}