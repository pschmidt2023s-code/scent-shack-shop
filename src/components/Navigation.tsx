import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, LogOut, ShoppingCart, Settings, Search, Menu, X, Heart } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationCenter } from './notifications/NotificationCenter';
import { Input } from '@/components/ui/input';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowSearch(false);
        setShowMobileMenu(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    setShowMobileMenu(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
    { to: '/about', label: 'Über uns' },
    { to: '/contact', label: 'Kontakt' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs sm:text-sm font-medium">
        Kostenloser Versand ab 50 EUR | 14 Tage Rückgaberecht
      </div>

      {/* Main Navigation */}
      <nav 
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-background/95 backdrop-blur-lg shadow-md border-b border-border' 
            : 'bg-background border-b border-border'
        }`}
        data-testid="main-navigation"
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left: Mobile Menu + Logo */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                data-testid="button-mobile-menu"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>

              <Link to="/" className="flex items-center" data-testid="link-home">
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-wider text-foreground">
                  ALDENAIR
                </span>
              </Link>
            </div>

            {/* Center: Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium transition-colors relative py-2 ${
                    isActive(link.to)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                  {isActive(link.to) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Notifications (logged in users) */}
              {user && <NotificationCenter />}

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                asChild
                className="hidden sm:flex"
              >
                <Link to="/favorites" data-testid="link-wishlist">
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>

              {/* Cart */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCart(true)}
                className="relative"
                data-testid="button-cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full font-bold">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Button>

              {/* User Menu */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    data-testid="button-user-menu"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {user.fullName || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                        onClick={() => setShowUserMenu(false)}
                        data-testid="link-profile"
                      >
                        <User className="w-4 h-4" />
                        Mein Profil
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                          onClick={() => setShowUserMenu(false)}
                          data-testid="link-admin"
                        >
                          <Settings className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-2 border-border" />
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors"
                        data-testid="button-logout"
                      >
                        <LogOut className="w-4 h-4" />
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <AuthModal>
                  <Button size="sm" data-testid="button-login">
                    Anmelden
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>

        {/* Search Overlay */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 shadow-lg animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-2xl mx-auto flex gap-2">
              <Input
                type="search"
                placeholder="Suche nach Düften, Marken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
                autoFocus
                data-testid="input-search"
              />
              <Button onClick={() => setShowSearch(false)} variant="ghost" size="icon">
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl animate-in slide-in-from-top-2 duration-200">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                  onClick={() => setShowMobileMenu(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(' ', '-')}`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <div className="pt-4 border-t border-border mt-4">
                  <AuthModal>
                    <Button className="w-full" data-testid="button-mobile-login">
                      Anmelden / Registrieren
                    </Button>
                  </AuthModal>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <CartSidebar open={showCart} onOpenChange={setShowCart} />
    </>
  );
};

export default Navigation;
