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
      <nav className="glass sticky top-0 z-50 border-b border-border/10 rounded-b-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-3 nav-link group">
                <span className="text-2xl md:text-3xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                  ALDENAIR
                </span>
              </Link>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Removed customer reviews section */}

              {/* Advanced Search */}
              <div className="hidden lg:flex flex-1 max-w-md">
                <AdvancedSearch className="w-full" />
              </div>

              {/* Dark Mode Toggle */}
              <DarkModeToggle />

              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-1.5 sm:p-2 text-foreground hover:text-primary transition-colors"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2 text-foreground hover:text-primary transition-colors"
                  >
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="hidden md:block text-sm truncate max-w-24">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 glass-card py-1 z-50">
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
                  <button className="bg-foreground text-background px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-md hover:bg-foreground/90 transition-colors">
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
