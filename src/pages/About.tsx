import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Users, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-12 lg:py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Über ALDENAIR
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Wir sind Ihr Partner für exklusive Düfte - mit Leidenschaft für Qualität 
            und dem Ziel, Luxusparfüms für jeden zugänglich zu machen.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <ValueCard 
            icon={<Sparkles className="w-8 h-8" />}
            title="Qualität"
            description="Nur die besten Inhaltsstoffe für langanhaltende, hochwertige Düfte."
          />
          <ValueCard 
            icon={<Users className="w-8 h-8" />}
            title="Kundennähe"
            description="Persönlicher Service und Beratung für den perfekten Duft."
          />
          <ValueCard 
            icon={<Heart className="w-8 h-8" />}
            title="Leidenschaft"
            description="Jeder Duft wird mit Liebe zum Detail kreiert."
          />
          <ValueCard 
            icon={<Award className="w-8 h-8" />}
            title="Erfahrung"
            description="Jahrelange Expertise in der Welt der Premium-Düfte."
          />
        </div>

        {/* Story Section */}
        <div className="bg-card border border-border rounded-2xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
                Unsere Geschichte
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  ALDENAIR wurde aus der Überzeugung geboren, dass jeder Mensch 
                  Zugang zu hochwertigen Düften haben sollte - ohne dafür ein 
                  Vermögen ausgeben zu müssen.
                </p>
                <p>
                  Wir haben es uns zur Aufgabe gemacht, Düfte zu kreieren, die 
                  von den bekanntesten Luxusmarken der Welt inspiriert sind. 
                  Dabei setzen wir auf hochwertige Inhaltsstoffe und faire Preise.
                </p>
                <p>
                  Mit über 500 verschiedenen Düften und mehr als 10.000 zufriedenen 
                  Kunden sind wir stolz darauf, Ihr Vertrauen verdient zu haben.
                </p>
              </div>
            </div>
            <div className="bg-muted/50 rounded-xl p-8 space-y-6">
              <StatItem label="Gegründet" value="2020" />
              <StatItem label="Düfte im Sortiment" value="500+" />
              <StatItem label="Zufriedene Kunden" value="10.000+" />
              <StatItem label="Kundenbewertung" value="4.8 / 5" />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

function ValueCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="text-center hover:shadow-lg transition-shadow">
      <CardContent className="pt-8 pb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-border pb-4 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-lg font-bold text-foreground">{value}</span>
    </div>
  );
}

export default About;
