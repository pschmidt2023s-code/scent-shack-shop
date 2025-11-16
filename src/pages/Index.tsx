import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { TrustBadges } from '@/components/TrustBadges';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { AIRecommendations } from '@/components/AIRecommendations';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { ProductComparison } from '@/components/ProductComparison';
import { TouchOptimizations } from '@/components/mobile/TouchOptimizations';
import { KeyboardShortcuts } from '@/components/desktop/KeyboardShortcuts';

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
        <PerfumeGrid />
        <AIRecommendations />
        <RecentlyViewed />
      </main>
      
      <Footer />
      <PushNotificationPrompt />
      <ProductComparison />
    </div>
  );
};

export default Index;
