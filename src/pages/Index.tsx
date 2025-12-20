import { HeroSection } from '@/components/HeroSection';
import { PerfumeGrid } from '@/components/PerfumeGrid';
import { TrustSection } from '@/components/TrustSection';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { OrganizationSchema, WebsiteSchema } from '@/components/StructuredData';
import { PushNotificationPrompt } from '@/components/PushNotificationPrompt';
import { ProductComparison } from '@/components/ProductComparison';
import { TouchOptimizations } from '@/components/mobile/TouchOptimizations';
import { KeyboardShortcuts } from '@/components/desktop/KeyboardShortcuts';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, Percent, Star, Sparkles } from 'lucide-react';
import { ScentStylist } from '@/components/features/ScentStylist';
import { ScentCalendar } from '@/components/features/ScentCalendar';
import { ScentMemory } from '@/components/features/ScentMemory';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <OrganizationSchema />
      <WebsiteSchema />
      <TouchOptimizations />
      <KeyboardShortcuts />
      <Navigation />
      
      <main id="main-content" role="main" aria-label="Hauptinhalt">
        <HeroSection />
        
        {/* Features Section */}
        <section className="py-12 lg:py-16 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Star className="w-6 h-6" />}
                title="Premium Qualität"
                description="Nur die besten Inhaltsstoffe für langanhaltende Düfte"
              />
              <FeatureCard 
                icon={<Gift className="w-6 h-6" />}
                title="Gratis Proben"
                description="Bei jeder Bestellung kostenlose Duftproben"
              />
              <FeatureCard 
                icon={<Percent className="w-6 h-6" />}
                title="Faire Preise"
                description="Luxus-Qualität zu erschwinglichen Preisen"
              />
            </div>
          </div>
        </section>
        
        {/* Products Section */}
        <section className="py-12 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Unsere Kollektion
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Entdecke unsere sorgfältig ausgewählten Premium-Düfte
              </p>
            </div>
            
            {/* Sparsets Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <Card className="hover-elevate overflow-visible border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Gift className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">50ml Sparset</h3>
                      <p className="text-sm text-muted-foreground">3 oder 5 Flaschen nach Wahl</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Stelle dein individuelles Set aus 50ml Flaschen zusammen und spare bis zu 20%
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/sparsets" data-testid="link-sparset-50ml">
                      Set zusammenstellen
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover-elevate overflow-visible border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Percent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Probenset</h3>
                      <p className="text-sm text-muted-foreground">5 Proben nach Wahl</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Wähle 5 Duftproben aus und entdecke deine neuen Lieblingsdüfte
                  </p>
                  <Button className="w-full" asChild>
                    <Link to="/probensets" data-testid="link-probenset">
                      Proben auswählen
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            <h3 className="text-2xl font-bold text-foreground text-center mb-8">Unsere Bestseller</h3>
            <p className="text-muted-foreground text-center mb-8 max-w-xl mx-auto">
              Premium-Düfte inspiriert von weltbekannten Marken
            </p>
            
            <PerfumeGrid />
            
            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link to="/products" data-testid="link-all-products">
                  Alle Produkte ansehen
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* AI Features Section */}
        <section className="py-12 lg:py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Einzigartige Features</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                Dein personalisiertes Dufterlebnis
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Entdecke innovative Tools, die dir helfen, den perfekten Duft zu finden
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ScentStylist />
              <ScentCalendar />
              <ScentMemory />
            </div>
          </div>
        </section>

        <TrustSection />
        
        {/* Newsletter CTA */}
        <section className="py-16 lg:py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">
              Bleibe auf dem Laufenden
            </h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
              Melde dich für unseren Newsletter an und erhalte exklusive Angebote und Neuigkeiten.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Deine E-Mail-Adresse"
                className="flex-1 px-4 py-3 rounded-lg bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary-foreground/30"
                data-testid="input-newsletter-email"
              />
              <Button 
                variant="secondary" 
                size="lg"
                className="whitespace-nowrap"
                data-testid="button-newsletter-subscribe"
              >
                Anmelden
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <MobileBottomNav />
      <PushNotificationPrompt />
      <ProductComparison />
    </div>
  );
};

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="pt-8 pb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export default Index;
