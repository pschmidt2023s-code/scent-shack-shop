
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
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fade-in-up">
          <span className="inline-block opacity-0 animate-slide-in-left" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            Willkommen bei
          </span>
          <span className="block text-luxury-gold animate-scale-in-bounce glow-pulse" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
            ALDENAIR
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-in-up" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
          Prestige Flakon - Exklusive Parfüms in höchster Qualität. 
          Entdecke unsere einzigartigen Duftkreationen für jeden Anlass.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-slide-up" style={{ animationDelay: '1.1s', animationFillMode: 'forwards' }}>
          <Button variant="hero" size="lg" className="group text-lg px-8 py-4 hover-glow transition-all duration-500 hover:scale-105 hover:rotate-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden" asChild>
            <Link to="/products">
              <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                Parfüms entdecken
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-luxury-gold via-luxury-gold-light to-luxury-gold opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Link>
          </Button>
          
          <Button variant="luxury" size="lg" className="group text-lg px-8 py-4 hover-lift transition-all duration-500 hover:scale-105 hover:-rotate-1 relative overflow-hidden" asChild>
            <Link to="/products#proben">
              <span className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                Proben bestellen
              </span>
              <div className="absolute inset-0 bg-luxury-gold opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-md"></div>
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-center">
          <div className="group space-y-2 opacity-0 animate-slide-in-left hover:scale-105 transition-all duration-500" style={{ animationDelay: '1.4s', animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-4 hover-glow transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 animate-float shadow-luxury">
              <span className="text-luxury-black font-bold text-2xl transition-transform duration-300 group-hover:scale-110">✓</span>
            </div>
            <h3 className="font-semibold text-xl group-hover:text-luxury-gold transition-colors duration-300">Kostenloser Versand</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">innerhalb Deutschland</p>
          </div>
          
          <div className="group space-y-2 opacity-0 animate-fade-in-up hover:scale-105 transition-all duration-500" style={{ animationDelay: '1.6s', animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-4 hover-glow transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 animate-float shadow-luxury" style={{ animationDelay: '1s' }}>
              <span className="text-luxury-black font-bold text-2xl transition-transform duration-300 group-hover:scale-110">⚡</span>
            </div>
            <h3 className="font-semibold text-xl group-hover:text-luxury-gold transition-colors duration-300">Schnelle Lieferung</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">3-7 Werktage</p>
          </div>
          
          <div className="group space-y-2 opacity-0 animate-slide-in-right hover:scale-105 transition-all duration-500" style={{ animationDelay: '1.8s', animationFillMode: 'forwards' }}>
            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-4 hover-glow transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 animate-float shadow-luxury" style={{ animationDelay: '2s' }}>
              <span className="text-luxury-black font-bold text-2xl transition-transform duration-300 group-hover:scale-110">♥</span>
            </div>
            <h3 className="font-semibold text-xl group-hover:text-luxury-gold transition-colors duration-300">Proben verfügbar</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300">5ml für nur 4,99€</p>
          </div>
        </div>
      </div>
    </section>
  );
}
