import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <span className="text-xl font-bold text-foreground">ALDENAIR</span>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Deine Premium-Destination für exquisite Parfüms und Düfte. Hochwertige Duftkreationen inspiriert von weltbekannten Luxusmarken.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Shop</h3>
            <div className="space-y-2">
              <Link to="/shop" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-shop">
                Alle Produkte
              </Link>
              <Link to="/shop?category=herren" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-herren">
                Herren
              </Link>
              <Link to="/shop?category=damen" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-damen">
                Damen
              </Link>
              <Link to="/shop?category=unisex" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-unisex">
                Unisex
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Service</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-contact">
                Kontakt
              </Link>
              <Link to="/faq" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-faq">
                FAQ
              </Link>
              <Link to="/returns" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-returns">
                Rückgabe
              </Link>
              <Link to="/partner" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-partner">
                Partner werden
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Rechtliches</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-privacy">
                Datenschutz
              </Link>
              <Link to="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-terms">
                AGB
              </Link>
              <Link to="/imprint" className="block text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-footer-imprint">
                Impressum
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-6">
              <a href="mailto:info@aldenair.de" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-email">
                <Mail className="w-4 h-4" />
                info@aldenair.de
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
