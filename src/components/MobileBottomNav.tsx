import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'
import { CartSidebar } from './CartSidebar'
import { useState } from 'react'

const NAV_ITEMS = [
  {
    icon: Home,
    label: 'Home',
    href: '/',
    activeHref: '/'
  },
  {
    icon: Search,
    label: 'Suchen',
    href: '/products',
    activeHref: '/products'
  },
  {
    icon: ShoppingBag,
    label: 'Warenkorb',
    href: '#cart',
    activeHref: '/cart',
    showBadge: true,
    isAction: true
  },
  {
    icon: Heart,
    label: 'Favoriten',
    href: '/favorites',
    activeHref: '/favorites',
    isAction: false
  },
  {
    icon: User,
    label: 'Profil',
    href: '/profile',
    activeHref: '/profile',
    requiresAuth: true
  }
]

export function MobileBottomNav() {
  const location = useLocation()
  const { itemCount } = useCart()
  const { user } = useAuth()
  const { count: favoritesCount } = useFavorites()
  const [showCart, setShowCart] = useState(false)

  const handleCartClick = () => {
    setShowCart(true)
  }

  const handleWishlistClick = () => {
    window.location.href = '/favorites';
  }

  const handleItemClick = (item: any) => {
    if (item.isAction) {
      if (item.label === 'Warenkorb') {
        handleCartClick()
      } else if (item.label === 'Favoriten') {
        handleWishlistClick()
      }
    }
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-18 md:hidden" aria-hidden="true" />
      
      <nav 
        className="fixed bottom-0 left-0 right-0 z-[9999] md:hidden glass-nav rounded-t-[2rem]"
        style={{ 
          paddingBottom: 'max(env(safe-area-inset-bottom), 8px)',
          paddingTop: '8px'
        }}
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        <div className="grid grid-cols-5 h-16 px-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.activeHref || 
              (item.activeHref === '/products' && location.pathname.startsWith('/product'))
            
            // Don't show profile tab if user is not authenticated
            if (item.requiresAuth && !user) {
              return (
                <div key={item.href} className="flex items-center justify-center">
                  {/* Empty space to maintain grid layout */}
                </div>
              )
            }

            // Handle action items (cart, wishlist)
            if (item.isAction) {
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  onClick={() => handleItemClick(item)}
                  className={cn(
                    "group relative flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-all duration-200 h-full rounded-xl",
                    "hover:bg-primary/10 active:scale-95",
                    isActive 
                      ? "text-primary font-semibold" 
                      : "text-foreground hover:text-primary"
                  )}
                >
                  <div className="relative">
                    <Icon className="w-6 h-6" strokeWidth={2.5} />
                    
                    {item.showBadge && itemCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold"
                      >
                        {itemCount}
                      </Badge>
                    )}
                  </div>
                  
                  <span className={cn(
                    "text-[10px] font-medium transition-colors leading-tight",
                    isActive ? "text-primary" : "text-foreground"
                  )}>
                    {item.label}
                  </span>
                </Button>
              )
            }

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-0.5 px-1.5 py-1.5 transition-all duration-200 h-full rounded-xl",
                  "hover:bg-primary/10 active:scale-95",
                  isActive 
                    ? "text-primary font-semibold" 
                    : "text-foreground hover:text-primary"
                )}
              >
                <div className="relative">
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                  
                  {item.label === 'Favoriten' && favoritesCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center px-1.5 text-[10px] font-bold"
                    >
                      {favoritesCount}
                    </Badge>
                  )}
                </div>
                
                <span className={cn(
                  "text-[10px] font-medium transition-colors leading-tight",
                  isActive ? "text-primary" : "text-foreground"
                )}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>

      <CartSidebar open={showCart} onOpenChange={setShowCart} />
    </>
  )
}
