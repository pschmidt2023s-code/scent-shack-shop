import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, ChevronDown, LogOut } from "lucide-react";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';

const Navigation = () => {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Parfümerie
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Cart */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* User Authentication */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 text-gray-600 hover:text-gray-900"
                  >
                    <User className="w-6 h-6" />
                    <span className="hidden sm:block">
                      {user.user_metadata?.full_name || user.email}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="w-4 h-4 inline-block mr-2" />
                        Mein Profil
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="w-4 h-4 inline-block mr-2" />
                        Abmelden
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <AuthModal>
                  <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">
                    Anmelden
                  </button>
                </AuthModal>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
      />
    </>
  );
}

export default Navigation;
