import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { TrustBadges } from '@/components/TrustBadges';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { ProductComparison } from '@/components/ProductComparison';
import { TouchOptimizations } from '@/components/mobile/TouchOptimizations';
import { KeyboardShortcuts } from '@/components/desktop/KeyboardShortcuts';
import { lazy, Suspense } from 'react';
import { Card } from '@/components/ui/card';

// Lazy load heavy components
const BundleSection = lazy(() => import('@/components/BundleSection').then(m => ({ default: m.BundleSection })));
const AIRecommendations = lazy(() => import('@/components/AIRecommendations').then(m => ({ default: m.AIRecommendations })));

const Index = () => {
  usePerformanceMonitor();

  return (
    <div className="min-h-screen overflow-x-hidden">
      <OrganizationSchema />
      <WebsiteSchema />
      <TouchOptimizations />
      <KeyboardShortcuts />
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt" className="pb-24 md:pb-0">
        <HeroSection />
        <TrustBadges />
        
        <Suspense fallback={
          <section className="py-16 glass rounded-3xl mx-4 my-8">
            <div className="container mx-auto px-4">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            </div>
          </section>
        }>
          <BundleSection />
        </Suspense>
        
        <PerfumeGrid />
        
        <Suspense fallback={
          <section className="py-8 md:py-12 glass">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="h-80 animate-pulse bg-muted" />
                ))}
              </div>
            </div>
          </section>
        }>
          <AIRecommendations />
        </Suspense>
        
        <RecentlyViewed />
      </main>
      
      <Footer />
      <PushNotificationPrompt />
      <ProductComparison />
    </div>
  );
};

export default Index;
