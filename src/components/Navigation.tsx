import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut, ShoppingCart, Settings } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';
import { AdvancedSearch } from './AdvancedSearch';
import { DarkModeToggle } from './DarkModeToggle';
import { MegaMenu } from './desktop/MegaMenu';
import { NotificationCenter } from './notifications/NotificationCenter';
import { HamburgerMenu } from './mobile/HamburgerMenu';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <HamburgerMenu />
              <Link to="/" className="flex items-center group" data-testid="link-home">
                <span className="text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  ALDENAIR
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <MegaMenu />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden lg:block w-64">
                <AdvancedSearch className="w-full" />
              </div>

              <DarkModeToggle />

              {user && <NotificationCenter />}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(true)}
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </Button>
              <CartSidebar open={showCart} onOpenChange={setShowCart} />

              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2"
                    data-testid="button-user-menu"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden md:block text-sm truncate max-w-24">
                      {user.fullName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="hidden md:block w-4 h-4" />
                  </Button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-2 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        data-testid="link-profile"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Mein Profil
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserMenu(false)}
                          data-testid="link-admin"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <AuthModal>
                  <Button data-testid="button-login">
                    Anmelden
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
