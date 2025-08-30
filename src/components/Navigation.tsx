import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { User, ChevronDown, LogOut } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { CartSidebar } from './CartSidebar';
import { AdvancedSearch } from './AdvancedSearch';

const Navigation = () => {
  const { user, signOut } = useAuth();
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
              <Link to="/" className="flex items-center space-x-3 nav-link">
                <img 
                  src="/lovable-uploads/f39391b1-7ea2-4b3f-9f06-15ca980668cb.png" 
                  alt="ALDENAIR Logo" 
                  className="h-8 w-auto transition-transform duration-300 hover:scale-110"
                />
                <span className="text-2xl font-bold text-gray-900">ALDENAIR</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {/* Advanced Search */}
              <div className="hidden md:flex flex-1 max-w-md">
                <AdvancedSearch className="w-full" />
              </div>

              {/* Cart */}
              <CartSidebar />

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
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </>
  );
}

export default Navigation;
