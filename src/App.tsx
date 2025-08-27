import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import ProductDetails from '@/pages/ProductDetails';
import Profile from '@/pages/Profile';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from "@/components/ui/toaster"
import { QueryClient } from 'react-query';
import Contact from '@/pages/Contact';
import Returns from '@/pages/Returns';
import FAQ from '@/pages/FAQ';

function App() {
  return (
    <QueryClient>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/faq" element={<FAQ />} />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClient>
  );
}

export default App;
