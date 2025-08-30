import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

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
    href: '/cart',
    activeHref: '/cart',
    showBadge: true
  },
  {
    icon: Heart,
    label: 'Favoriten',
    href: '/wishlist',
    activeHref: '/wishlist'
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

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the nav */}
      <div className="h-16 md:hidden" />
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
        <div className="grid grid-cols-5 h-16">
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

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex flex-col items-center justify-center px-2 py-2 transition-all duration-200",
                  "hover:bg-muted/50 active:scale-95",
                  isActive 
                    ? "text-primary bg-primary/5" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className="relative">
                  <Icon 
                    className={cn(
                      "w-5 h-5 transition-transform duration-200",
                      isActive && "scale-110"
                    )} 
                  />
                  
                  {/* Cart badge */}
                  {item.showBadge && itemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-bounce"
                    >
                      {itemCount > 99 ? '99+' : itemCount}
                    </Badge>
                  )}
                </div>
                
                <span 
                  className={cn(
                    "text-xs mt-1 transition-all duration-200",
                    isActive ? "font-medium" : "font-normal"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}