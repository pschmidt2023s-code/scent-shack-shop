
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { SocialProof } from '@/components/SocialProof';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { PerformanceOptimizer } from '@/components/PerformanceOptimizer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <PerformanceOptimizer />
      {/* Social Proof Banner */}
      {/* <SocialProof variant="banner" /> */}
      
      <Navigation />
      
      <main>
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
