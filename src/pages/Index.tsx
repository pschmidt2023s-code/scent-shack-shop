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
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background to-muted/20">
      <OrganizationSchema />
      <WebsiteSchema />
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt" className="pb-24 md:pb-0">
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
