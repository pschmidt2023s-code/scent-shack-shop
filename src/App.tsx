import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { LiveChat } from '@/components/LiveChat';
import { PageTransition } from '@/components/PageTransition';
import { AnimatedLogo } from '@/components/AnimatedLogo';
import { Breadcrumbs } from '@/components/Breadcrumbs';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Etwas ist schiefgelaufen</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded"
            >
              Seite neu laden
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load non-critical routes for better performance
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

// Create QueryClient instance
let queryClient: QueryClient;

function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          refetchOnWindowFocus: false,
          staleTime: 5 * 60 * 1000, // 5 minutes
        },
      },
    });
  }
  return queryClient;
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center space-y-4 animate-fade-in">
      <div className="relative">
        <div className="w-8 h-8 border-4 border-luxury-gold/20 border-t-luxury-gold rounded-full animate-spin" />
        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent border-t-luxury-gold/60 rounded-full animate-ping" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">Lädt...</p>
    </div>
  </div>
);

function AnimatedRoutes() {
  return (
    <>
      <Breadcrumbs />
      <Routes>
        <Route path="/" element={
          <PageTransition>
            <Index />
          </PageTransition>
        } />
      <Route path="/products" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Products />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/favorites" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Favorites />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/product/:id" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <ProductDetail />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/profile" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Profile />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/partner" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Partner />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/auth" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Auth />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/admin" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Admin />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/contact" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Contact />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/returns" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Returns />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/faq" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <FAQ />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/newsletter" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Newsletter />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/privacy" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Privacy />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/terms" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Terms />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/imprint" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Imprint />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/checkout" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Checkout />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/checkout-bank" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <CheckoutBank />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/checkout-success" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <CheckoutSuccess />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/checkout-cancel" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <CheckoutCancel />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/paypal-test" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <PayPalTest />
          </PageTransition>
        </Suspense>
      } />
      <Route path="/contest" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <Contest />
          </PageTransition>
        </Suspense>
      } />
      <Route path="*" element={
        <Suspense fallback={<LoadingSpinner />}>
          <PageTransition>
            <NotFound />
          </PageTransition>
        </Suspense>
      } />
    </Routes>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={getQueryClient()}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen bg-background transition-all duration-300">
                  <AnimatedRoutes />
                  <Toaster />
                  <LiveChat />
                </div>
              </Router>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;