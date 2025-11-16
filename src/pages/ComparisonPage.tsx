import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { ProductComparisonDetail } from '@/components/ProductComparisonDetail';
import { MobileBottomNav } from '@/components/MobileBottomNav';

const ComparisonPage = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <ProductComparisonDetail />
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

export default ComparisonPage;
