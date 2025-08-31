import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Bot, 
  Clock,
  CheckCircle,
  Minimize2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  content: string
  sender: 'user' | 'support' | 'bot'
  timestamp: Date
  status?: 'sent' | 'delivered' | 'read'
}

interface LiveChatProps {
  className?: string
}

const SUPPORT_HOURS = {
  start: 9,
  end: 18,
  timezone: 'CET'
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Hallo! 👋 Willkommen bei ALDENAIR. Wie kann ich Ihnen heute helfen?',
    sender: 'bot',
    timestamp: new Date(),
    status: 'read'
  }
]

const FAQ_SUGGESTIONS = [
  'Wie lange dauert der Versand?',
  'Kann ich eine Probe bestellen?',
  'Was ist die Rückgaberichtlinie?',
  'Gibt es Mengenrabatte?'
]

const BOT_RESPONSES: Record<string, string> = {
  'versand': 'Unser Standardversand dauert 3-7 Werktage innerhalb Deutschlands. Kostenloser Versand ab 50€ Bestellwert.',
  'probe': 'Ja! Wir bieten 5ml Proben für 4,99€ an. So können Sie unsere Düfte testen, bevor Sie sich für die 50ml Flasche entscheiden.',
  'rückgabe': 'Sie haben 30 Tage Rückgaberecht. Ungeöffnete Artikel können kostenfrei zurückgesendet werden.',
  'rabatt': 'Für Neukunden gibt es 10% Rabatt beim Newsletter-Abo. Stammkunden erhalten regelmäßige Angebote per E-Mail.',
  'default': 'Vielen Dank für Ihre Nachricht! Ein Mitarbeiter wird sich in Kürze bei Ihnen melden. Unsere Servicezeiten sind Mo-Fr 9:00-18:00 Uhr.'
}

function isSupportOnline(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  
  // Weekend check (0 = Sunday, 6 = Saturday)
  if (day === 0 || day === 6) return false
  
  return hour >= SUPPORT_HOURS.start && hour < SUPPORT_HOURS.end
}

export function LiveChat({ className }: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState({ name: '', email: '' })
  const [isFirstMessage, setIsFirstMessage] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supportOnline = isSupportOnline()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession()
      setUnreadCount(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (sessionId) {
      loadMessages()
      
      // Subscribe to real-time messages
      const subscription = supabase
        .channel(`chat-session-${sessionId}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'chat_messages',
            filter: `session_id=eq.${sessionId}`
          },
          (payload) => {
            const newMessage = payload.new as any;
            if (newMessage.sender_type === 'admin' || newMessage.sender_type === 'bot') {
              const message: Message = {
                id: newMessage.id,
                content: newMessage.content,
                sender: newMessage.sender_type === 'admin' ? 'support' : 'bot',
                timestamp: new Date(newMessage.created_at),
                status: 'read'
              };
              setMessages(prev => [...prev, message]);
              
              if (!isOpen) {
                setUnreadCount(prev => prev + 1);
              }
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [sessionId, isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const generateBotResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase()
    
    if (message.includes('versand') || message.includes('lieferung')) {
      return BOT_RESPONSES.versand
    } else if (message.includes('probe') || message.includes('test')) {
      return BOT_RESPONSES.probe
    } else if (message.includes('rückgabe') || message.includes('zurück')) {
      return BOT_RESPONSES.rückgabe
    } else if (message.includes('rabatt') || message.includes('angebot')) {
      return BOT_RESPONSES.rabatt
    } else {
      return BOT_RESPONSES.default
    }
  }

  const initializeSession = async () => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_info: userInfo.name || userInfo.email ? userInfo : null,
          status: 'active'
        }])
        .select()
        .single();

      if (sessionError) throw sessionError;
      
      setSessionId(session.id);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  const loadMessages = async () => {
    if (!sessionId) return;

    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const dbMessages: Message[] = data.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender_type === 'user' ? 'user' : (msg.sender_type === 'admin' ? 'support' : 'bot'),
        timestamp: new Date(msg.created_at),
        status: msg.status as 'sent' | 'delivered' | 'read'
      }));

      // Combine initial messages with database messages
      setMessages([...INITIAL_MESSAGES, ...dbMessages]);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent || !sessionId) return;

    // If this is the first message and we don't have user info, ask for it
    if (isFirstMessage && !userInfo.name && !userInfo.email) {
      const name = prompt('Wie dürfen wir Sie ansprechen? (Optional)') || '';
      const email = prompt('Ihre E-Mail für besseren Support: (Optional)') || '';
      
      if (name || email) {
        setUserInfo({ name, email });
        
        // Update session with user info
        await supabase
          .from('chat_sessions')
          .update({ user_info: { name, email } })
          .eq('id', sessionId);
      }
      setIsFirstMessage(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    try {
      // Save message to database
      await supabase
        .from('chat_messages')
        .insert([{
          session_id: sessionId,
          sender_type: 'user',
          content: messageContent,
          status: 'sent',
          user_info: userInfo.name || userInfo.email ? userInfo : null
        }]);

      // Update session last message time
      await supabase
        .from('chat_sessions')
        .update({ 
          last_message_at: new Date().toISOString(),
          status: 'pending'
        })
        .eq('id', sessionId);

      // Auto-respond with bot if no admin is available
      if (!supportOnline) {
        setIsTyping(true);
        
        setTimeout(async () => {
          const botResponse = generateBotResponse(messageContent);
          
          await supabase
            .from('chat_messages')
            .insert([{
              session_id: sessionId,
              sender_type: 'bot',
              content: botResponse,
              status: 'sent'
            }]);

          setIsTyping(false);
        }, 1000 + Math.random() * 2000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Revert optimistic update on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-muted-foreground" />
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-muted-foreground" />
      case 'read':
        return <CheckCircle className="w-3 h-3 text-primary" />
      default:
        return null
    }
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-all duration-200",
          isOpen && "hidden",
          className
        )}
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs animate-bounce"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-4 right-4 z-50 w-80 h-96 shadow-xl flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between p-3 border-b">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white",
                  supportOnline ? "bg-green-500" : "bg-gray-400"
                )} />
              </div>
              <div>
                <CardTitle className="text-sm">ALDENAIR Support</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {supportOnline ? 'Online' : 'Außerhalb der Geschäftszeiten'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                <Minimize2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-2",
                      message.sender === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.sender !== 'user' && (
                      <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                        {message.sender === 'bot' ? (
                          <Bot className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                      </div>
                    )}
                    
                    <div className={cn(
                      "max-w-[70%] rounded-lg px-3 py-2 text-sm",
                      message.sender === 'user' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                    )}>
                      <p>{message.content}</p>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender === 'user' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3" />
                    </div>
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </CardContent>

              {/* FAQ Suggestions */}
              {messages.length <= 1 && (
                <div className="p-3 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Häufige Fragen:</p>
                  <div className="space-y-1">
                    {FAQ_SUGGESTIONS.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-xs h-8"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ihre Nachricht..."
                    className="flex-1 text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage()
                      }
                    }}
                  />
                  <Button 
                    size="icon" 
                    onClick={() => sendMessage()}
                    disabled={!inputValue.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      )}
    </>
  )
}