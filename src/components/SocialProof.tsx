import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Users, ShoppingBag, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialProofProps {
  className?: string
  variant?: 'inline' | 'card' | 'banner'
}

const SOCIAL_PROOF_DATA = {
  totalCustomers: 12847,
  averageRating: 4.8,
  totalReviews: 3241,
  monthlyOrders: 892,
  satisfactionRate: 98
}

const RECENT_PURCHASES = [
  { name: 'Maria K.', product: 'ALDENAIR 978', location: 'Berlin', time: '2 Min' },
  { name: 'Thomas S.', product: 'ALDENAIR 399', location: 'München', time: '5 Min' },
  { name: 'Lisa M.', product: 'ALDENAIR 527', location: 'Hamburg', time: '8 Min' },
  { name: 'Andreas W.', product: 'ALDENAIR 999', location: 'Köln', time: '12 Min' },
  { name: 'Sandra B.', product: 'ALDENAIR 275', location: 'Frankfurt', time: '15 Min' },
]

export function SocialProof({ className, variant = 'inline' }: SocialProofProps) {
  const [currentPurchase, setCurrentPurchase] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentPurchase((prev) => (prev + 1) % RECENT_PURCHASES.length)
        setIsVisible(true)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  if (variant === 'banner') {
    return (
      <div className={cn("bg-primary text-primary-foreground py-2 px-4", className)}>
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-6 text-sm font-medium">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{SOCIAL_PROOF_DATA.totalCustomers.toLocaleString('de-DE')}+ zufriedene Kunden</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 fill-current" />
              <span>{SOCIAL_PROOF_DATA.averageRating}/5 Sterne</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>{SOCIAL_PROOF_DATA.satisfactionRate}% Zufriedenheit</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Vertrauen Sie auf unsere Qualität</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {SOCIAL_PROOF_DATA.totalCustomers.toLocaleString('de-DE')}+
                </div>
                <div className="text-sm text-muted-foreground">Kunden</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary flex items-center justify-center gap-1">
                  {SOCIAL_PROOF_DATA.averageRating}
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="text-sm text-muted-foreground">Bewertung</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {SOCIAL_PROOF_DATA.totalReviews.toLocaleString('de-DE')}+
                </div>
                <div className="text-sm text-muted-foreground">Bewertungen</div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">
                  {SOCIAL_PROOF_DATA.satisfactionRate}%
                </div>
                <div className="text-sm text-muted-foreground">Zufrieden</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Inline variant (default)
  return (
    <div className={cn("flex items-center gap-4 text-sm", className)}>
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className="w-4 h-4 fill-yellow-400 text-yellow-400"
            />
          ))}
        </div>
        <span className="font-medium">{SOCIAL_PROOF_DATA.averageRating}/5</span>
        <span className="text-muted-foreground">
          ({SOCIAL_PROOF_DATA.totalReviews.toLocaleString('de-DE')} Bewertungen)
        </span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          {SOCIAL_PROOF_DATA.totalCustomers.toLocaleString('de-DE')}+ Kunden vertrauen uns
        </span>
      </div>
    </div>
  )
}

// Recent Purchase Notification Component
export function RecentPurchaseNotification({ className }: { className?: string }) {
  const [currentPurchase, setCurrentPurchase] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentPurchase((prev) => (prev + 1) % RECENT_PURCHASES.length)
        setIsVisible(true)
      }, 300)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const purchase = RECENT_PURCHASES[currentPurchase]

  return (
    <div 
      className={cn(
        "fixed bottom-4 left-4 z-50 bg-background border rounded-lg shadow-lg p-3 max-w-sm transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <ShoppingBag className="w-4 h-4 text-green-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {purchase.name} aus {purchase.location}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            hat gerade <span className="font-medium">{purchase.product}</span> gekauft
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          vor {purchase.time}
        </Badge>
      </div>
    </div>
  )
}