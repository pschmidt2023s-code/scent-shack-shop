import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  User,
  CheckCircle2,
  Users,
  MessageSquare,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatSession {
  id: string;
  userId: string | null;
  userInfo: any;
  status: string;
  lastMessageAt: string;
  createdAt: string;
  messages?: ChatMessage[];
  unreadCount?: number;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string | null;
  senderType: string;
  content: string;
  status: string;
  userInfo?: any;
  createdAt: string;
}

export default function AdminChatInterface() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedSession) {
      loadMessages(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/admin/chat-sessions', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data || []);
      } else {
        setSessions([]);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
      toast({
        title: "Fehler",
        description: "Chat-Sitzungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/chat-sessions/${sessionId}/messages`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Fehler",
        description: "Nachrichten konnten nicht geladen werden",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !selectedSession) return;

    try {
      const response = await fetch(`/api/admin/chat-sessions/${selectedSession}/messages`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputValue.trim(),
          senderType: 'admin',
        }),
      });

      if (!response.ok) throw new Error('Failed to send');

      setInputValue('');
      loadMessages(selectedSession);
      loadSessions();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Fehler",
        description: "Nachricht konnte nicht gesendet werden",
        variant: "destructive",
      });
    }
  };

  const closeSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/admin/chat-sessions/${sessionId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      if (!response.ok) throw new Error('Failed to close');

      loadSessions();
      if (selectedSession === sessionId) {
        setSelectedSession(null);
        setMessages([]);
      }

      toast({
        title: "Erfolg",
        description: "Chat-Sitzung wurde geschlossen",
      });
    } catch (error) {
      console.error('Error closing session:', error);
      toast({
        title: "Fehler",
        description: "Sitzung konnte nicht geschlossen werden",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'secondary',
      closed: 'outline'
    } as const;

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeSessions = sessions.filter(s => s.status === 'active');
  const pendingSessions = sessions.filter(s => s.status === 'pending');
  const closedSessions = sessions.filter(s => s.status === 'closed');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle className="w-8 h-8 animate-pulse mx-auto mb-2" />
          <p className="text-muted-foreground">Lade Chat-Sitzungen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Chat-Sitzungen
              </CardTitle>
              <Button size="icon" variant="ghost" onClick={loadSessions}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <Tabs defaultValue="active" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-3">
                <TabsTrigger value="active" className="flex items-center gap-1 text-xs">
                  Aktiv ({activeSessions.length})
                </TabsTrigger>
                <TabsTrigger value="pending" className="flex items-center gap-1 text-xs">
                  Wartend ({pendingSessions.length})
                </TabsTrigger>
                <TabsTrigger value="closed" className="flex items-center gap-1 text-xs">
                  Geschlossen ({closedSessions.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="active" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-2">
                      {activeSessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedSession === session.id && "bg-muted border-primary"
                          )}
                          onClick={() => setSelectedSession(session.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {session.userInfo?.name || session.userInfo?.email || 'Anonym'}
                              </span>
                            </div>
                            {(session.unreadCount ?? 0) > 0 && (
                              <Badge variant="destructive" className="h-5 min-w-5 text-xs">
                                {session.unreadCount}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Zuletzt: {formatDate(session.lastMessageAt)}
                          </p>
                        </div>
                      ))}
                      {activeSessions.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Keine aktiven Chats</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="pending" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-2">
                      {pendingSessions.map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors",
                            selectedSession === session.id && "bg-muted border-primary"
                          )}
                          onClick={() => setSelectedSession(session.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {session.userInfo?.name || session.userInfo?.email || 'Anonym'}
                              </span>
                            </div>
                            {getStatusBadge(session.status)}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Erstellt: {formatDate(session.createdAt)}
                          </p>
                        </div>
                      ))}
                      {pendingSessions.length === 0 && (
                        <div className="text-center py-8">
                          <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Keine wartenden Chats</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="closed" className="h-full m-0">
                  <ScrollArea className="h-full">
                    <div className="p-3 space-y-2">
                      {closedSessions.slice(0, 20).map((session) => (
                        <div
                          key={session.id}
                          className={cn(
                            "p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors opacity-60",
                            selectedSession === session.id && "bg-muted border-primary opacity-100"
                          )}
                          onClick={() => setSelectedSession(session.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span className="font-medium text-sm">
                                {session.userInfo?.name || session.userInfo?.email || 'Anonym'}
                              </span>
                            </div>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Geschlossen: {formatDate(session.lastMessageAt)}
                          </p>
                        </div>
                      ))}
                      {closedSessions.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Keine geschlossenen Chats</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            {selectedSession ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">
                      {sessions.find(s => s.id === selectedSession)?.userInfo?.name || 
                       sessions.find(s => s.id === selectedSession)?.userInfo?.email || 
                       'Anonymer Nutzer'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Status: {getStatusBadge(sessions.find(s => s.id === selectedSession)?.status || 'active')}
                    </p>
                  </div>
                </div>
                
                {sessions.find(s => s.id === selectedSession)?.status !== 'closed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => closeSession(selectedSession)}
                  >
                    Chat schließen
                  </Button>
                )}
              </div>
            ) : (
              <CardTitle>Wählen Sie eine Chat-Sitzung aus</CardTitle>
            )}
          </CardHeader>

          {selectedSession ? (
            <>
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex gap-2",
                          message.senderType === 'admin' ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.senderType !== 'admin' && (
                          <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <User className="w-3 h-3" />
                          </div>
                        )}
                        
                        <div className={cn(
                          "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                          message.senderType === 'admin' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          <p>{message.content}</p>
                          <div className="flex items-center justify-between mt-1 gap-2">
                            <span className="text-xs opacity-70">
                              {formatTime(message.createdAt)}
                            </span>
                            {message.senderType === 'admin' && (
                              <div className="flex items-center gap-1">
                                {message.status === 'sent' && <Clock className="w-3 h-3" />}
                                {message.status === 'read' && <CheckCircle2 className="w-3 h-3" />}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
              </CardContent>

              {sessions.find(s => s.id === selectedSession)?.status !== 'closed' && (
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ihre Antwort..."
                      className="flex-1"
                      data-testid="input-chat-message"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      size="icon" 
                      onClick={sendMessage}
                      disabled={!inputValue.trim()}
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Wählen Sie eine Chat-Sitzung aus der Liste links aus, um Nachrichten anzuzeigen und zu antworten.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
