import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Badge } from '@/components/ui/badge';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';
import { AdvancedSearch } from './AdvancedSearch';
import { DarkModeToggle } from './DarkModeToggle';
import { AnimatedLogo } from './AnimatedLogo';

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
      <nav className="bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 nav-link group">
                <div className="relative">
                  <AnimatedLogo className="h-10 w-10" />
                </div>
                <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ALDENAIR
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Removed customer reviews section */}

              {/* Advanced Search */}
              <div className="hidden md:flex flex-1 max-w-md">
                <AdvancedSearch className="w-full" />
              </div>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 1.5M7 13l-1.5-1.5M16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                {itemCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {itemCount > 99 ? '99+' : itemCount}
                  </Badge>
                )}
              </button>
              <CartSidebar open={showCart} onOpenChange={setShowCart} />

              {/* User Authentication */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden sm:block">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-50 border border-border">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 inline-block mr-2" />
                        Mein Profil
                      </Link>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 inline-block mr-2" />
                        Admin
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-popover-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <LogOut className="w-4 h-4 inline-block mr-2" />
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <AuthModal>
                  <button className="bg-foreground text-background px-4 py-2 rounded-md hover:bg-foreground/90 transition-colors">
                    Anmelden
                  </button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navigation;
