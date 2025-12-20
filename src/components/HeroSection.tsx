import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Truck, Shield, Clock, Star, Gift } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

export function HeroSection() {
  const { user } = useAuth();
  const { tier, tierLabel, discount, cashbackBalance } = useUserRole();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:32px_32px]" />
      </div>

      <div className="absolute top-10 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Premium Qualität</span>
            </div>

            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight tracking-tight">
                Luxusdüfte die
                <span className="block bg-gradient-to-r from-primary via-primary to-primary/80 bg-clip-text text-transparent mt-2">
                  begeistern
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Entdecke unsere exklusive Kollektion hochwertiger Parfüms - 
                inspiriert von weltbekannten Luxusmarken, zu fairen Preisen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
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

            <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-2 animate-in fade-in slide-in-from-bottom-5 duration-1000">
              <TrustBadge icon={Truck} text="Gratis ab 50 EUR" />
              <TrustBadge icon={Shield} text="14 Tage Rückgabe" />
              <TrustBadge icon={Clock} text="1-3 Tage Lieferung" />
            </div>
          </div>

          <div className="hidden lg:block animate-in fade-in slide-in-from-right-6 duration-1000">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent rounded-3xl blur-2xl animate-pulse" style={{ animationDuration: '3s' }} />
              
              <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  <StatCard value="500+" label="Düfte" icon={<Sparkles className="w-5 h-5" />} />
                  <StatCard value="4.8" label="Bewertung" icon={<Star className="w-5 h-5 fill-primary" />} highlight />
                  <StatCard value="10k+" label="Zufriedene Kunden" />
                  <StatCard value="24h" label="Schneller Versand" icon={<Truck className="w-5 h-5" />} />
                </div>
                
                {user && discount > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-lg">
                          <Gift className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tierLabel}</p>
                          <p className="text-xs text-muted-foreground">Dein aktueller Status</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">{discount}%</p>
                        <p className="text-xs text-muted-foreground">Rabatt</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!user && (
                  <div className="mt-6 pt-6 border-t border-border text-center">
                    <p className="text-sm text-muted-foreground">
                      Vertrauen Sie auf jahrelange Erfahrung
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <MobileStatCard value="500+" label="Düfte" />
            <MobileStatCard value="4.8" label="Bewertung" highlight />
            <MobileStatCard value="10k+" label="Kunden" />
            <MobileStatCard value="24h" label="Versand" />
          </div>
          
          {user && discount > 0 && (
            <div className="mt-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">{tierLabel}</span>
              </div>
              <span className="text-lg font-bold text-primary">{discount}% Rabatt</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Icon className="w-5 h-5 text-primary" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function StatCard({ value, label, highlight = false, icon }: { value: string; label: string; highlight?: boolean; icon?: React.ReactNode }) {
  return (
    <div className={`p-5 rounded-xl text-center transition-all duration-300 hover:scale-[1.02] ${
      highlight 
        ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20' 
        : 'bg-muted/30 border border-border/50'
    }`}>
      {icon && <div className="flex justify-center mb-2 text-primary">{icon}</div>}
      <div className={`text-2xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function MobileStatCard({ value, label, highlight = false }: { value: string; label: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl p-4 text-center ${
      highlight 
        ? 'bg-gradient-to-br from-primary/15 to-primary/5 border border-primary/20' 
        : 'bg-card border border-border'
    }`}>
      <div className={`text-xl font-bold ${highlight ? 'text-primary' : 'text-foreground'}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
