
import Navigation from '@/components/Navigation';
import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { Footer } from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* DEBUG: Direct Admin Link */}
      <div className="p-4 bg-red-100 border border-red-300">
        <p>DEBUG: <a href="/admin" className="text-blue-500 underline">Direct Admin Link</a></p>
      </div>
      
      <main>
        <HeroSection />
        <PerfumeGrid />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
