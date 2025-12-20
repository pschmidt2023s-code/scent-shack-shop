import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Send,
  User,
  Loader2,
  RefreshCw,
  Archive,
  Trash2,
  Search
} from 'lucide-react';

interface ChatSession {
  id: string;
  visitorName: string;
  visitorEmail: string;
  status: 'active' | 'waiting' | 'closed';
  lastMessage: string;
  createdAt: string;
  unreadCount: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  content: string;
  sender: 'visitor' | 'admin';
  createdAt: string;
}

export default function LiveChatManagement() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession.id);
    }
  }, [selectedSession]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/chat/sessions', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/sessions/${sessionId}/messages`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!selectedSession || !newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/admin/chat/sessions/${selectedSession.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newMessage.trim() }),
      });

      if (response.ok) {
        const message = await response.json();
        setMessages([...messages, message]);
        setNewMessage('');
      } else {
        toast({
          title: "Fehler",
          description: "Nachricht konnte nicht gesendet werden",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/chat/sessions/${sessionId}/close`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Chat geschlossen",
          description: "Der Chat wurde erfolgreich geschlossen",
        });
        loadSessions();
        if (selectedSession?.id === sessionId) {
          setSelectedSession(null);
        }
      }
    } catch (error) {
      console.error('Error closing session:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aktiv</Badge>;
      case 'waiting':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Wartend</Badge>;
      case 'closed':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Geschlossen</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredSessions = sessions.filter(session => 
    session.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    session.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    active: sessions.filter(s => s.status === 'active').length,
    waiting: sessions.filter(s => s.status === 'waiting').length,
    closed: sessions.filter(s => s.status === 'closed').length,
    total: sessions.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Live Chat Verwaltung</h2>
          <p className="text-muted-foreground">Verwalten Sie Kundenanfragen in Echtzeit</p>
        </div>
        <Button onClick={loadSessions} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Aktualisieren
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-400">Aktiv</p>
                <p className="text-2xl font-bold text-green-400">{stats.active}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-500/10 border-yellow-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-yellow-400">Wartend</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.waiting}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-500/10 border-gray-500/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-400">Geschlossen</p>
                <p className="text-2xl font-bold text-gray-400">{stats.closed}</p>
              </div>
              <Archive className="w-8 h-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Chat-Anfragen</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {filteredSessions.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Keine Chat-Anfragen vorhanden</p>
                  <p className="text-xs mt-1">Neue Anfragen erscheinen hier automatisch</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredSessions.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                        selectedSession?.id === session.id ? 'bg-primary/10 border-l-2 border-l-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium truncate">{session.visitorName || 'Anonym'}</p>
                            {session.unreadCount > 0 && (
                              <Badge className="bg-primary text-primary-foreground text-xs px-1.5">
                                {session.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{session.visitorEmail}</p>
                          <p className="text-sm text-muted-foreground mt-1 truncate">{session.lastMessage}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          {getStatusBadge(session.status)}
                          <span className="text-xs text-muted-foreground">
                            {new Date(session.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          {selectedSession ? (
            <>
              <CardHeader className="pb-3 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {selectedSession.visitorName || 'Anonym'}
                    </CardTitle>
                    <CardDescription>{selectedSession.visitorEmail}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedSession.status)}
                    {selectedSession.status !== 'closed' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => closeSession(selectedSession.id)}
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Schließen
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[400px]">
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <p>Keine Nachrichten vorhanden</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.sender === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.createdAt).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                
                {selectedSession.status !== 'closed' && (
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Nachricht eingeben..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || sending}
                        className="self-end"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-[480px] text-muted-foreground">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">Kein Chat ausgewählt</p>
                <p className="text-sm">Wählen Sie einen Chat aus der Liste aus</p>
              </div>
            </div>
          )}
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Hinweis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Die Live-Chat-Funktion ermöglicht direkte Kommunikation mit Ihren Kunden. 
            Neue Chat-Anfragen werden automatisch hier angezeigt, sobald ein Kunde den Chat auf der Website startet.
            Für Echtzeit-Updates aktualisieren Sie die Seite regelmäßig oder implementieren Sie WebSocket-Integration.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
