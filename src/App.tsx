import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";

const ProductDetail = React.lazy(() => import('@/pages/ProductDetail'));
const Products = React.lazy(() => import('@/pages/Products'));
const Favorites = React.lazy(() => import('@/pages/Favorites'));
const Profile = React.lazy(() => import('@/pages/Profile'));
const Contact = React.lazy(() => import('@/pages/Contact'));
const Returns = React.lazy(() => import('@/pages/Returns'));
const FAQ = React.lazy(() => import('@/pages/FAQ'));
const Newsletter = React.lazy(() => import('@/pages/Newsletter'));
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Imprint = React.lazy(() => import('@/pages/Imprint'));
const Partner = React.lazy(() => import('@/pages/Partner'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Auth = React.lazy(() => import('@/pages/Auth'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const CheckoutBank = React.lazy(() => import('@/pages/CheckoutBank'));
const CheckoutSuccess = React.lazy(() => import('@/pages/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('@/pages/CheckoutCancel'));
const PayPalTest = React.lazy(() => import('@/pages/PayPalTest'));
const Contest = React.lazy(() => import('@/pages/Contest'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 5 * 60 * 1000 },
  },
});

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/products" element={<Suspense fallback={<LoadingSpinner />}><Products /></Suspense>} />
                  <Route path="/product/:id" element={<Suspense fallback={<LoadingSpinner />}><ProductDetail /></Suspense>} />
                  <Route path="/favorites" element={<Suspense fallback={<LoadingSpinner />}><Favorites /></Suspense>} />
                  <Route path="/profile" element={<Suspense fallback={<LoadingSpinner />}><Profile /></Suspense>} />
                  <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact /></Suspense>} />
                  <Route path="/returns" element={<Suspense fallback={<LoadingSpinner />}><Returns /></Suspense>} />
                  <Route path="/faq" element={<Suspense fallback={<LoadingSpinner />}><FAQ /></Suspense>} />
                  <Route path="/newsletter" element={<Suspense fallback={<LoadingSpinner />}><Newsletter /></Suspense>} />
                  <Route path="/privacy" element={<Suspense fallback={<LoadingSpinner />}><Privacy /></Suspense>} />
                  <Route path="/terms" element={<Suspense fallback={<LoadingSpinner />}><Terms /></Suspense>} />
                  <Route path="/imprint" element={<Suspense fallback={<LoadingSpinner />}><Imprint /></Suspense>} />
                  <Route path="/partner" element={<Suspense fallback={<LoadingSpinner />}><Partner /></Suspense>} />
                  <Route path="/admin" element={<Suspense fallback={<LoadingSpinner />}><Admin /></Suspense>} />
                  <Route path="/auth" element={<Suspense fallback={<LoadingSpinner />}><Auth /></Suspense>} />
                  <Route path="/checkout" element={<Suspense fallback={<LoadingSpinner />}><Checkout /></Suspense>} />
                  <Route path="/checkout-bank" element={<Suspense fallback={<LoadingSpinner />}><CheckoutBank /></Suspense>} />
                  <Route path="/checkout-success" element={<Suspense fallback={<LoadingSpinner />}><CheckoutSuccess /></Suspense>} />
                  <Route path="/checkout-cancel" element={<Suspense fallback={<LoadingSpinner />}><CheckoutCancel /></Suspense>} />
                  <Route path="/paypal-test" element={<Suspense fallback={<LoadingSpinner />}><PayPalTest /></Suspense>} />
                  <Route path="/contest" element={<Suspense fallback={<LoadingSpinner />}><Contest /></Suspense>} />
                  <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
