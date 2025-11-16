
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
          sizes="(max-width: 768px) 896px, 1344px"
          alt="ALDENAIR luxury perfume collection - Premium Parfüms und exklusive Duftkreationen"
          className="w-full h-full object-cover"
          loading="eager"
          decoding="async"
          fetchPriority="high"
          width="1344"
          height="768"
          data-priority="high"
          role="img"
          aria-label="ALDENAIR Luxus-Parfüm-Kollektion Hintergrundbild"
          style={{ 
            contentVisibility: 'auto', 
            containIntrinsicSize: '1344px 768px',
            imageRendering: 'crisp-edges'
          }}
        />
        <div className="absolute inset-0 bg-gradient-hero opacity-80"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-primary-foreground px-4 max-w-4xl mx-auto">
        <h1 
          className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2"
          aria-label="Willkommen bei ALDENAIR - Premium Parfüms"
        >
          <span className="inline-block text-white">
            Willkommen bei
          </span>
          <span 
            className="block text-luxury-gold" 
            role="text"
            aria-label="ALDENAIR Markenname"
          >
            ALDENAIR
          </span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl mb-6 sm:mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed px-4">
          Prestige Flakon - Exklusive Parfüms in höchster Qualität. 
          Entdecke unsere einzigartigen Duftkreationen für jeden Anlass.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
          <Button 
            variant="gold" 
            size="lg" 
            className="group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 hover:scale-105 relative overflow-hidden font-semibold w-full sm:w-auto" 
            asChild
          >
            <Link 
              to="/products?category=50ML Bottles"
              aria-label="Parfüm-Kollektion entdecken - 50ml Flaschen"
              role="button"
            >
              <span className="relative z-10">
                Parfüms entdecken
              </span>
            </Link>
          </Button>
          
          <Button 
            variant="gold" 
            size="lg" 
            className="group text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 transition-all duration-300 hover:scale-105 relative overflow-hidden w-full sm:w-auto" 
            asChild
          >
            <Link 
              to="/products?category=Proben"
              aria-label="Parfüm-Proben bestellen - 5ml Testgrößen"
              role="button"
            >
              <span className="relative z-10">
                Proben bestellen
              </span>
            </Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 text-center px-4">
          <div className="group space-y-2 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110">
              <span className="text-luxury-black font-bold text-xl sm:text-2xl">✓</span>
            </div>
            <h3 className="font-semibold text-lg sm:text-xl group-hover:text-luxury-gold transition-colors duration-300 dark:text-gradient-hero-dark">Kostenloser Versand</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 text-sm sm:text-base">innerhalb Deutschland</p>
          </div>
          
          <div className="group space-y-2 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110">
              <span className="text-luxury-black font-bold text-xl sm:text-2xl">⚡</span>
            </div>
            <h3 className="font-semibold text-lg sm:text-xl group-hover:text-luxury-gold transition-colors duration-300 dark:text-gradient-hero-dark">Schnelle Lieferung</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 text-sm sm:text-base">3-7 Werktage</p>
          </div>
          
          <div className="group space-y-2 hover:scale-105 transition-all duration-300">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-luxury-gold to-luxury-gold-light rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-all duration-300 group-hover:scale-110">
              <span className="text-luxury-black font-bold text-xl sm:text-2xl">♥</span>
            </div>
            <h3 className="font-semibold text-lg sm:text-xl group-hover:text-luxury-gold transition-colors duration-300 dark:text-gradient-hero-dark">Proben verfügbar</h3>
            <p className="text-gray-300 group-hover:text-gray-200 transition-colors duration-300 text-sm sm:text-base">5ml für nur 4,99€</p>
          </div>
        </div>
      </div>
    </section>
  );
}
