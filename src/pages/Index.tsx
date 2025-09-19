
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <MobileOptimization />
      <PerformanceOptimizer />
      <AccessibilityEnhancer />
      {/* Social Proof Banner */}
      {/* <SocialProof variant="banner" /> */}
      
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt" className="pb-mobile-nav">
        <HeroSection />
        <PerfumeGrid />
        <RecentlyViewed />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
