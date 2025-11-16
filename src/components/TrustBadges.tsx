import { Shield, Lock, Truck, RotateCcw, Award, CreditCard } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: Lock,
      title: 'SSL Verschlüsselt',
      description: '100% sichere Zahlung',
    },
    {
      icon: Truck,
      title: 'Kostenloser Versand',
      description: 'Ab 0€ in Deutschland',
    },
    {
      icon: RotateCcw,
      title: '30 Tage Rückgabe',
      description: 'Problemlose Rückgabe',
    },
    {
      icon: Award,
      title: 'Premium Qualität',
      description: 'Geprüfte Düfte',
    },
    {
      icon: Shield,
      title: 'Käuferschutz',
      description: 'Ihre Sicherheit',
    },
    {
      icon: CreditCard,
      title: 'Sichere Zahlung',
      description: 'PayPal & Kreditkarte',
    },
  ];

  return (
    <section className="py-8 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.title}
              className="flex flex-col items-center text-center p-4 rounded-lg glass-card hover:shadow-lg group transition-all duration-300"
            >
              <badge.icon className="h-8 w-8 mb-2 text-luxury-gold group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xs sm:text-sm font-semibold mb-1 text-foreground">
                {badge.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {badge.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
