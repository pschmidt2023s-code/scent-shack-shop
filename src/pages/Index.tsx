import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
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
