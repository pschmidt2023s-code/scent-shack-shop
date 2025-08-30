import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from "@/components/ui/toaster";
import { LiveChat } from '@/components/LiveChat';

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
const Privacy = React.lazy(() => import('@/pages/Privacy'));
const Terms = React.lazy(() => import('@/pages/Terms'));
const Imprint = React.lazy(() => import('@/pages/Imprint'));
const Partner = React.lazy(() => import('@/pages/Partner'));
const Admin = React.lazy(() => import('@/pages/Admin'));
const Checkout = React.lazy(() => import('@/pages/Checkout'));
const CheckoutBank = React.lazy(() => import('@/pages/CheckoutBank'));
const CheckoutSuccess = React.lazy(() => import('@/pages/CheckoutSuccess'));
const CheckoutCancel = React.lazy(() => import('@/pages/CheckoutCancel'));
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
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={getQueryClient()}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <Router>
                <div className="min-h-screen bg-background transition-all duration-300">
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Products />
                  </Suspense>
                } />
                <Route path="/favorites" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Favorites />
                  </Suspense>
                } />
                <Route path="/product/:id" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ProductDetail />
                  </Suspense>
                } />
                <Route path="/profile" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Profile />
                  </Suspense>
                } />
                <Route path="/partner" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Partner />
                  </Suspense>
                } />
                <Route path="/admin" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Admin />
                  </Suspense>
                } />
                <Route path="/contact" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Contact />
                  </Suspense>
                } />
                <Route path="/returns" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Returns />
                  </Suspense>
                } />
                <Route path="/faq" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <FAQ />
                  </Suspense>
                } />
                <Route path="/privacy" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Privacy />
                  </Suspense>
                } />
                <Route path="/terms" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Terms />
                  </Suspense>
                } />
                <Route path="/imprint" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Imprint />
                  </Suspense>
                } />
                <Route path="/checkout" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <Checkout />
                  </Suspense>
                } />
                <Route path="/checkout-bank" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CheckoutBank />
                  </Suspense>
                } />
                <Route path="/checkout-success" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CheckoutSuccess />
                  </Suspense>
                } />
                <Route path="/checkout-cancel" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CheckoutCancel />
                  </Suspense>
                } />
                <Route path="*" element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <NotFound />
                  </Suspense>
                } />
                  </Routes>
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