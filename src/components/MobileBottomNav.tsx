import { Link, useLocation } from 'react-router-dom'
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { useFavorites } from '@/hooks/useFavorites'
import { cn } from '@/lib/utils'
import { CartSidebar } from './CartSidebar'
import { useState, useEffect } from 'react'

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
    // Navigate to favorites page
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
      <div className="h-20 md:hidden" />
      
      {/* Bottom Navigation with Enhanced Design */}
      <nav className="fixed bottom-0 left-0 right-0 z-[9999] bg-background/95 backdrop-blur-lg border-t border-border/50 md:hidden shadow-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
        <div className="grid grid-cols-5 h-20 px-2">
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
                    "group relative flex flex-col items-center justify-center px-3 py-3 transition-all duration-300 h-20 rounded-2xl mx-1 my-2",
                    "hover:bg-gradient-to-t hover:from-primary/10 hover:to-primary/5 active:scale-95",
                    "hover:shadow-lg hover:shadow-primary/20",
                    isActive 
                      ? "text-primary bg-gradient-to-t from-primary/15 to-primary/5 shadow-md shadow-primary/30" 
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {/* Glow effect for active state */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-primary/10 opacity-50 blur-sm"></div>
                  )}
                  
                  <div className="relative z-10">
                    <div className="relative mb-1">
                      <Icon 
                        className={cn(
                          "w-6 h-6 transition-all duration-300",
                          isActive && "scale-110 drop-shadow-sm",
                          "group-hover:scale-105 group-active:scale-95"
                        )} 
                      />
                      
                      {/* Enhanced Cart badge */}
                      {item.showBadge && itemCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className={cn(
                            "absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold",
                            "shadow-lg border-2 border-background",
                            "animate-pulse hover:animate-bounce transition-all duration-300"
                          )}
                        >
                          {itemCount > 99 ? '99+' : itemCount}
                        </Badge>
                      )}
                      
                      {/* Active indicator dot */}
                      {isActive && (
                        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                      )}
                    </div>
                    
                    <span 
                      className={cn(
                        "text-xs transition-all duration-300",
                        isActive ? "font-semibold" : "font-medium",
                        "group-hover:font-semibold"
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                </Button>
              )
            }

            // Regular link items
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center px-3 py-3 transition-all duration-300 h-20 rounded-2xl mx-1 my-2",
                  "hover:bg-gradient-to-t hover:from-primary/10 hover:to-primary/5 active:scale-95",
                  "hover:shadow-lg hover:shadow-primary/20",
                  isActive 
                    ? "text-primary bg-gradient-to-t from-primary/15 to-primary/5 shadow-md shadow-primary/30" 
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {/* Glow effect for active state */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-primary/20 to-primary/10 opacity-50 blur-sm"></div>
                )}
                
                <div className="relative z-10">
                  <div className="relative mb-1">
                    <Icon 
                      className={cn(
                        "w-6 h-6 transition-all duration-300",
                        isActive && "scale-110 drop-shadow-sm",
                        "group-hover:scale-105 group-active:scale-95"
                      )} 
                    />
                    
                    {/* Enhanced Favorites badge */}
                    {item.label === 'Favoriten' && favoritesCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className={cn(
                          "absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold",
                          "shadow-lg border-2 border-background",
                          "animate-pulse hover:animate-bounce transition-all duration-300"
                        )}
                      >
                        {favoritesCount > 99 ? '99+' : favoritesCount}
                      </Badge>
                    )}
                    
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
                    )}
                  </div>
                  
                  <span 
                    className={cn(
                      "text-xs transition-all duration-300",
                      isActive ? "font-semibold" : "font-medium",
                      "group-hover:font-semibold"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar open={showCart} onOpenChange={setShowCart} />
    </>
  )
}