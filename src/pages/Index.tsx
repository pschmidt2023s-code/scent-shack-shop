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

const Index = () => {
  usePerformanceMonitor();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <OrganizationSchema />
      <WebsiteSchema />
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt" className="pb-mobile-nav">
        <HeroSection />
        <TrustBadges />
        <PerfumeGrid />
        <AIRecommendations />
        <RecentlyViewed />
      </main>
      
      <Footer />
      <MobileBottomNav />
      <PushNotificationPrompt />
    </div>
  );
};

export default Index;
