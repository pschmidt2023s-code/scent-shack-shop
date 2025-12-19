import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut, ShoppingCart, Settings, Search, Menu, X } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';
import { DarkModeToggle } from './DarkModeToggle';
import { NotificationCenter } from './notifications/NotificationCenter';
import { Input } from '@/components/ui/input';

const Navigation = () => {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
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

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Kollektion' },
    { to: '/about', label: 'Über uns' },
    { to: '/contact', label: 'Kontakt' },
  ];

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/98 backdrop-blur-xl shadow-lg border-b border-border/50' 
          : 'bg-transparent'
      }`}>
        {/* Top Bar - Desktop */}
        <div className="hidden lg:block border-b border-border/30">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex justify-between items-center h-10 text-xs text-muted-foreground">
              <div className="flex items-center gap-6">
                <span>Kostenloser Versand ab 50 EUR</span>
                <span className="text-border">|</span>
                <span>14 Tage Rückgaberecht</span>
              </div>
              <div className="flex items-center gap-4">
                <DarkModeToggle />
                {user && <NotificationCenter />}
              </div>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              data-testid="button-mobile-menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Logo */}
            <Link to="/" className="flex items-center" data-testid="link-home">
              <span className="text-2xl lg:text-3xl font-light tracking-[0.3em] text-foreground">
                ALDENAIR
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-wide"
                  data-testid={`link-nav-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSearch(!showSearch)}
                className="relative"
                data-testid="button-search"
              >
                <Search className="w-5 h-5" />
              </Button>

              {/* Mobile Dark Mode */}
              <div className="lg:hidden">
                <DarkModeToggle />
              </div>

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
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-primary text-primary-foreground text-xs rounded-full font-medium">
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
                      <div className="px-4 py-2 border-b border-border">
                        <p className="text-sm font-medium text-foreground truncate">
                          {user.fullName || user.email}
                        </p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
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
                  <Button variant="ghost" size="sm" className="hidden sm:flex" data-testid="button-login">
                    Anmelden
                  </Button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {showSearch && (
          <div className="absolute top-full left-0 right-0 bg-background border-b border-border p-4 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <Input
                type="search"
                placeholder="Suche nach Düften..."
                className="w-full"
                autoFocus
                data-testid="input-search"
              />
            </div>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-background border-b border-border shadow-xl">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block py-3 text-lg font-medium text-foreground border-b border-border/50"
                  onClick={() => setShowMobileMenu(false)}
                  data-testid={`link-mobile-${link.label.toLowerCase()}`}
                >
                  {link.label}
                </Link>
              ))}
              {!user && (
                <AuthModal>
                  <Button className="w-full mt-4" data-testid="button-mobile-login">
                    Anmelden
                  </Button>
                </AuthModal>
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
