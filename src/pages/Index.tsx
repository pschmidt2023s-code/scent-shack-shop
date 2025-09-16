
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SocialProof } from '@/components/SocialProof';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';
import { AccessibilityEnhancer } from '@/components/AccessibilityEnhancer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PerformanceOptimizer />
      <AccessibilityEnhancer />
      {/* Social Proof Banner */}
      {/* <SocialProof variant="banner" /> */}
      
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt">
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
