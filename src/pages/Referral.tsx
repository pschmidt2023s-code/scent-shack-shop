import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { ReferralProgram } from '@/components/ReferralProgram';

const Referral = () => {
  return (
    <div className="min-h-screen glass pb-20 md:pb-0">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <ReferralProgram />
        </div>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default Referral;
