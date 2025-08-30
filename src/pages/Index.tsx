
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SocialProof } from '@/components/SocialProof';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Social Proof Banner */}
      {/* <SocialProof variant="banner" /> */}
      
      <Navigation />
      
      <main>
        <HeroSection />
        <PerfumeGrid />
        <RecentlyViewed />
        
        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <NewsletterSignup className="max-w-4xl mx-auto" showIncentive={true} />
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Index;
