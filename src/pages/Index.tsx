
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { RecentlyViewed } from '@/components/RecentlyViewed';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { SocialProof, RecentPurchaseNotification } from '@/components/SocialProof';
import { LiveChat } from '@/components/LiveChat';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Social Proof Banner */}
      <SocialProof variant="banner" />
      
      <Navigation />
      
      <main>
        <HeroSection />
        <PerfumeGrid />
        <RecentlyViewed />
        
        {/* Social Proof Section */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <SocialProof variant="card" className="max-w-4xl mx-auto" />
          </div>
        </section>
        
        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-subtle">
          <div className="container mx-auto px-4">
            <NewsletterSignup className="max-w-4xl mx-auto" showIncentive={true} />
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileBottomNav />
      <LiveChat />
      <RecentPurchaseNotification />
    </div>
  );
};

export default Index;
