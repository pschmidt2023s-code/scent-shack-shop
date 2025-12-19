import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, Clock } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/30">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:40px_40px]" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 lg:right-40 w-64 lg:w-96 h-64 lg:h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 left-10 lg:left-20 w-48 lg:w-72 h-48 lg:h-72 bg-primary/3 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Qualität</span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
                Luxusdüfte die
                <span className="block text-primary mt-2">
                  begeistern
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Entdecke unsere exklusive Kollektion hochwertiger Parfüms - 
                inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 font-semibold"
                asChild
              >
                <Link to="/products" data-testid="link-shop-cta">
                  Jetzt entdecken
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6"
                asChild
              >
                <Link to="/about" data-testid="link-about-cta">
                  Mehr erfahren
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="w-5 h-5 text-primary" />
                <span className="text-sm">Gratis ab 50 EUR</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="w-5 h-5 text-primary" />
                <span className="text-sm">14 Tage Rückgabe</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span className="text-sm">1-3 Tage Lieferung</span>
              </div>
            </div>
          </div>

          {/* Right: Stats Cards */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-3xl blur-2xl" />
              
              {/* Stats Grid */}
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard value="500+" label="Düfte" />
                  <StatCard value="4.8" label="Bewertung" highlight />
                  <StatCard value="10k+" label="Zufriedene Kunden" />
                  <StatCard value="24h" label="Schneller Versand" />
                </div>
                
                {/* Featured Text */}
                <div className="mt-6 pt-6 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Vertrauen Sie auf jahrelange Erfahrung
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="lg:hidden mt-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MobileStatCard value="500+" label="Düfte" />
            <MobileStatCard value="4.8" label="Bewertung" />
            <MobileStatCard value="10k+" label="Kunden" />
            <MobileStatCard value="24h" label="Versand" />
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className={`p-6 rounded-xl text-center transition-colors ${
      highlight 
        ? 'bg-primary/10 border border-primary/20' 
        : 'bg-muted/50 border border-border'
    }`}>
      <div className={`text-3xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MobileStatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 text-center">
      <div className="text-2xl font-bold text-primary">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
