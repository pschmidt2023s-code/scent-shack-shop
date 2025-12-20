import { Shield, Truck, RotateCcw, CreditCard, Award, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

const trustItems = [
  {
    icon: Truck,
    title: 'Kostenloser Versand',
    description: 'Ab 50 EUR Bestellwert',
  },
  {
    icon: RotateCcw,
    title: '14 Tage Rückgabe',
    description: 'Kein Risiko beim Kauf',
  },
  {
    icon: Shield,
    title: 'Sichere Zahlung',
    description: 'SSL-verschlüsselt',
  },
  {
    icon: CreditCard,
    title: 'Flexible Zahlung',
    description: 'Kreditkarte, PayPal, Überweisung',
  },
  {
    icon: Award,
    title: 'Premium Qualität',
    description: 'Hochwertige Inhaltsstoffe',
  },
  {
    icon: Clock,
    title: 'Schneller Versand',
    description: '1-3 Werktage Lieferzeit',
  },
];

export function TrustSection() {
  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-3">
            Warum ALDENAIR?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Tausende zufriedene Kunden vertrauen uns - entdecke warum.
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {trustItems.map((item, index) => (
            <Card 
              key={index} 
              className="p-4 text-center bg-card/50 border-border/50 hover:bg-card transition-colors stagger-item"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
