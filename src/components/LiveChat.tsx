import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { sanitizeInput } from '@/lib/validation'
import DOMPurify from 'dompurify'
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
    content: 'Hallo! Willkommen bei ALDENAIR. Wie kann ich Ihnen heute helfen?',
    sender: 'bot',
    timestamp: new Date(),
    status: 'read'
  }
]

const FAQ_SUGGESTIONS = [
  'Wie lange dauert der Versand?',
  'Kann ich eine Probe bestellen?',
  'Was ist die Rueckgaberichtlinie?',
  'Gibt es Mengenrabatte?'
]

const BOT_RESPONSES: Record<string, string> = {
  'versand': 'Unser Standardversand dauert 3-7 Werktage innerhalb Deutschlands. Kostenloser Versand ab 50 Euro Bestellwert.',
  'probe': 'Ja! Wir bieten 5ml Proben fuer 4,99 Euro an. So koennen Sie unsere Duefte testen, bevor Sie sich fuer die 50ml Flasche entscheiden.',
  'rueckgabe': 'Sie haben 30 Tage Rueckgaberecht. Ungeoeffnete Artikel koennen kostenfrei zurueckgesendet werden.',
  'rabatt': 'Fuer Neukunden gibt es 10% Rabatt beim Newsletter-Abo. Stammkunden erhalten regelmaessige Angebote per E-Mail.',
  'preis': 'Unsere Parfuems starten ab 4,99 Euro fuer 5ml Proben und 29,99 Euro fuer 50ml Flakons.',
  'lieferung': 'Wir liefern deutschlandweit. Standardversand dauert 3-7 Werktage, Express 1-2 Werktage.',
  'zahlung': 'Wir akzeptieren Kreditkarte, PayPal, Klarna und Bankueberweisung.',
  'default': 'Vielen Dank fuer Ihre Nachricht! Ein Mitarbeiter wird sich in Kuerze bei Ihnen melden. Unsere Servicezeiten sind Mo-Fr 9:00-18:00 Uhr.'
}

function isSupportOnline(): boolean {
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  if (day === 0 || day === 6) return false
  return hour >= SUPPORT_HOURS.start && hour < SUPPORT_HOURS.end
}

function findBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase()
  for (const [keyword, response] of Object.entries(BOT_RESPONSES)) {
    if (keyword !== 'default' && lowerMessage.includes(keyword)) {
      return response
    }
  }
  return BOT_RESPONSES.default
}

export function LiveChat({ className }: LiveChatProps) {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const supportOnline = isSupportOnline()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
      inputRef.current?.focus()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const sanitizedMessage = sanitizeInput(inputValue.trim())
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: DOMPurify.sanitize(sanitizedMessage),
      sender: 'user',
      timestamp: new Date(),
      status: 'sent'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const botResponse = findBotResponse(sanitizedMessage)
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        status: 'read'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isOpen) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          data-testid="button-open-chat"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    )
  }

  if (isMinimized) {
    return (
      <div className={cn("fixed bottom-4 right-4 z-50", className)}>
        <Card className="w-72 shadow-lg cursor-pointer" onClick={() => setIsMinimized(false)}>
          <CardHeader className="p-3 flex flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className="font-medium text-sm">Live Chat</span>
            </div>
            <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      <Card className="w-80 md:w-96 h-[500px] shadow-xl flex flex-col">
        <CardHeader className="p-4 border-b flex flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <MessageCircle className="w-5 h-5 text-primary" />
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                supportOnline ? "bg-green-500" : "bg-yellow-500"
              )} />
            </div>
            <div>
              <CardTitle className="text-sm font-medium">ALDENAIR Support</CardTitle>
              <p className="text-xs text-muted-foreground">
                {supportOnline ? 'Online' : 'Offline - Bot aktiv'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="icon" variant="ghost" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => setIsOpen(false)} data-testid="button-close-chat">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2",
                message.sender === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.sender !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[75%] rounded-lg p-3",
                  message.sender === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <div className={cn(
                  "flex items-center gap-1 mt-1",
                  message.sender === 'user' ? "justify-end" : "justify-start"
                )}>
                  <Clock className="w-3 h-3 opacity-50" />
                  <span className="text-xs opacity-50">
                    {message.timestamp.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.sender === 'user' && message.status && (
                    <CheckCircle className="w-3 h-3 opacity-50" />
                  )}
                </div>
              </div>
              {message.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2 items-center">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary" />
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2">Haeufige Fragen:</p>
            <div className="flex flex-wrap gap-1">
              {FAQ_SUGGESTIONS.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`button-suggestion-${index}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nachricht eingeben..."
              className="flex-1"
              disabled={isTyping}
              data-testid="input-chat-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              data-testid="button-send-message"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
