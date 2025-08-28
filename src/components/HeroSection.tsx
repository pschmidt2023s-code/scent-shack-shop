
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-perfumes-optimized.webp';
import heroImageMd from '@/assets/hero-perfumes-md.webp';

export function HeroSection() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
         <img
           src={heroImage}
           srcSet={`${heroImageMd} 896w, ${heroImage} 1344w`}
           sizes="100vw"
           alt="ALDENAIR luxury perfume collection - Premium Parfüms und exklusive Duftkreationen"
           className="w-full h-full object-cover"
           loading="eager"
           decoding="async"
           fetchPriority="high"
           width="1344"
           height="768"
         />
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-primary-foreground px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Willkommen bei
          <span className="block text-luxury-gold">ALDENAIR</span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Prestige Flakon - Exklusive Parfüms in höchster Qualität. 
          Entdecke unsere einzigartigen Duftkreationen für jeden Anlass.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button variant="hero" size="lg" className="text-lg px-8 py-4" asChild>
            <Link to="/products">
              Parfüms entdecken
            </Link>
          </Button>
          
          <Button variant="luxury" size="lg" className="text-lg px-8 py-4" asChild>
            <Link to="/products#proben">
              Proben bestellen
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="space-y-2">
            <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-luxury-black font-bold text-xl">✓</span>
            </div>
            <h3 className="font-semibold text-lg">Kostenloser Versand</h3>
            <p className="text-gray-300">innerhalb Deutschland</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-luxury-black font-bold text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-lg">Schnelle Lieferung</h3>
            <p className="text-gray-300">3-7 Werktage</p>
          </div>
          
          <div className="space-y-2">
            <div className="w-12 h-12 bg-luxury-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-luxury-black font-bold text-xl">♥</span>
            </div>
            <h3 className="font-semibold text-lg">Proben verfügbar</h3>
            <p className="text-gray-300">5ml für nur 4,99€</p>
          </div>
        </div>
      </div>
    </section>
  );
}
