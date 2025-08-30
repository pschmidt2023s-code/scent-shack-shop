import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Mail, Gift, Sparkles, TrendingUp, CheckCircle } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface NewsletterSignupProps {
  variant?: 'default' | 'compact' | 'floating'
  className?: string
  showIncentive?: boolean
}

interface Preferences {
  product_updates: boolean
  promotions: boolean
  tips: boolean
  [key: string]: boolean  // Index signature for JSON compatibility
}

export function NewsletterSignup({ 
  variant = 'default', 
  className,
  showIncentive = true 
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [preferences, setPreferences] = useState<Preferences>({
    product_updates: true,
    promotions: true,
    tips: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast({
        title: "Ungültige E-Mail",
        description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert({
          email: email.trim().toLowerCase(),
          preferences: preferences as any  // Cast to any for JSON compatibility
        })

      if (error) {
        if (error.code === '23505') { // Duplicate key error
          toast({
            title: "Bereits angemeldet",
            description: "Diese E-Mail-Adresse ist bereits für unseren Newsletter angemeldet.",
            variant: "destructive"
          })
        } else {
          throw error
        }
        return
      }

      setSuccess(true)
      setEmail('')
      
      toast({
        title: "Erfolgreich angemeldet!",
        description: showIncentive 
          ? "Sie erhalten bald Ihren 10%-Rabattcode per E-Mail."
          : "Danke für Ihre Anmeldung zu unserem Newsletter.",
      })
    } catch (error) {
      console.error('Newsletter signup error:', error)
      toast({
        title: "Fehler bei der Anmeldung",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = (key: keyof Preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (success && variant === 'compact') {
    return (
      <div className={cn("flex items-center gap-2 text-green-600", className)}>
        <CheckCircle className="w-5 h-5" />
        <span className="text-sm font-medium">Newsletter erfolgreich abonniert!</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <form onSubmit={handleSubmit} className={cn("flex gap-2", className)}>
        <Input
          type="email"
          placeholder="E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !email.trim()}>
          {loading ? "..." : "Abonnieren"}
        </Button>
      </form>
    )
  }

  if (variant === 'floating') {
    return (
      <Card className={cn("fixed bottom-4 right-4 w-80 shadow-lg z-40", className)}>
        <CardContent className="p-4">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <span className="font-semibold">Newsletter</span>
                {showIncentive && (
                  <Badge variant="secondary" className="text-xs">10% Rabatt</Badge>
                )}
              </div>
              
              <Input
                type="email"
                placeholder="E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              
              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? "Wird angemeldet..." : "Jetzt anmelden"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-2">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
              <p className="font-semibold text-green-600">Erfolgreich angemeldet!</p>
              <p className="text-sm text-muted-foreground">
                {showIncentive ? "Ihr Rabattcode kommt per E-Mail." : "Danke für Ihre Anmeldung!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Default variant
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Mail className="w-6 h-6" />
          Newsletter abonnieren
        </CardTitle>
        
        {showIncentive && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Gift className="w-5 h-5 text-primary" />
            <Badge variant="default" className="text-sm px-3 py-1">
              10% Rabatt für Neukunden
            </Badge>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!success ? (
          <>
            {/* Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold text-sm">Neue Produkte</h3>
                <p className="text-xs text-muted-foreground">
                  Erfahren Sie zuerst von neuen Düften
                </p>
              </div>
              
              <div className="space-y-2">
                <TrendingUp className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold text-sm">Exklusive Angebote</h3>
                <p className="text-xs text-muted-foreground">
                  Spezielle Rabatte nur für Abonnenten
                </p>
              </div>
              
              <div className="space-y-2">
                <Mail className="w-8 h-8 mx-auto text-primary" />
                <h3 className="font-semibold text-sm">Duft-Tipps</h3>
                <p className="text-xs text-muted-foreground">
                  Experten-Tipps und Anwendungshinweise
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Ihre E-Mail-Adresse"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="text-center"
              />

              {/* Preferences */}
              <div className="space-y-3 p-4 bg-accent/20 border border-border rounded-lg">
                <h4 className="font-medium text-sm text-foreground">Was möchten Sie erhalten?</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="product_updates"
                      checked={preferences.product_updates}
                      onCheckedChange={(checked) => updatePreference('product_updates', checked as boolean)}
                    />
                    <label htmlFor="product_updates" className="text-sm cursor-pointer">
                      Produktupdates und neue Düfte
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="promotions"
                      checked={preferences.promotions}
                      onCheckedChange={(checked) => updatePreference('promotions', checked as boolean)}
                    />
                    <label htmlFor="promotions" className="text-sm cursor-pointer">
                      Angebote und Rabattaktionen
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="tips"
                      checked={preferences.tips}
                      onCheckedChange={(checked) => updatePreference('tips', checked as boolean)}
                    />
                    <label htmlFor="tips" className="text-sm cursor-pointer">
                      Duft-Tipps und Style-Guides
                    </label>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? "Wird angemeldet..." : showIncentive ? "Jetzt anmelden & 10% sparen" : "Jetzt anmelden"}
              </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground">
              Sie können sich jederzeit wieder abmelden. Ihre Daten werden vertraulich behandelt.
            </p>
          </>
        ) : (
          <div className="text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-2">
                Erfolgreich angemeldet!
              </h3>
              <p className="text-muted-foreground">
                {showIncentive 
                  ? "Sie erhalten in Kürze eine E-Mail mit Ihrem 10%-Rabattcode."
                  : "Danke für Ihre Anmeldung zu unserem Newsletter."
                }
              </p>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setSuccess(false)}
              className="mt-4"
            >
              Weitere E-Mail anmelden
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}