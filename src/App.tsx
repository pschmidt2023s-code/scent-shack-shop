import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from "@/components/ui/toaster"
import { PageTransition } from '@/components/PageTransition';

// Lazy load non-critical routes for better performance
const ProductDetail = React.lazy(() => import('@/pages/ProductDetail'));
const Products = React.lazy(() => import('@/pages/Products'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Returns = React.lazy(() => import('@/pages/Returns'));
const FAQ = React.lazy(() => import('@/pages/FAQ'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Imprint = React.lazy(() => import('@/pages/Imprint'));
const Partner = React.lazy(() => import('@/pages/Partner').then(module => ({ default: module.default })));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const CheckoutBank = React.lazy(() => import('@/pages/CheckoutBank'));
const CheckoutSuccess = React.lazy(() => import('@/pages/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('@/pages/CheckoutCancel'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                  <Route path="/" element={
                    <PageTransition>
                      <Index />
                    </PageTransition>
                  } />
                  <Route path="/products" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Products />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/product/:id" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <ProductDetail />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/profile" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Profile />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/partner" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Partner />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/admin" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Admin />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/contact" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Contact />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/returns" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Returns />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/faq" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <FAQ />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/privacy" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Privacy />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/terms" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Terms />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/imprint" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Imprint />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/checkout" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <Checkout />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/checkout-bank" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <CheckoutBank />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/checkout-success" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <CheckoutSuccess />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="/checkout-cancel" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <CheckoutCancel />
                      </PageTransition>
                    </Suspense>
                  } />
                  <Route path="*" element={
                    <Suspense fallback={<div className="min-h-screen flex items-center justify-center animate-fade-in">Loading...</div>}>
                      <PageTransition>
                        <NotFound />
                      </PageTransition>
                    </Suspense>
                  } />
              </Routes>
              <Toaster />
            </div>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;