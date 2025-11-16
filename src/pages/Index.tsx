
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SocialProof } from '@/components/SocialProof';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileOptimization } from '@/components/MobileOptimization';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';
import { AccessibilityEnhancer } from '@/components/AccessibilityEnhancer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { SkipToContent } from '@/components/SkipToContent';
import { TrustBadges } from '@/components/TrustBadges';
import { HomeReviewsSection } from '@/components/HomeReviewsSection';
import { ExitIntentPopup } from '@/components/ExitIntentPopup';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SkipToContent />
      <MobileOptimization />
      <PerformanceOptimizer />
      <AccessibilityEnhancer />
      <ExitIntentPopup />
      
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt" className="pb-mobile-nav">
        <HeroSection />
        <TrustBadges />
        <PerfumeGrid />
        <HomeReviewsSection />
        <RecentlyViewed />
      </main>
      
      <Footer />
      <MobileBottomNav />
      <ScrollToTop />
    </div>
  );
};

export default Index;
