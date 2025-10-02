
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-bold text-luxury-gold">ALDENAIR</span>
            <p className="text-muted-foreground">
              Deine Premium-Destination für exquisite Parfüms und Düfte der Weltklasse.
            </p>
          </div>

          {/* Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-luxury-gold">Service</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Kontakt
              </Link>
              <Link to="/returns" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Rückgabe
              </Link>
              <Link to="/faq" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                FAQ
              </Link>
              <Link to="/newsletter" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Newsletter
              </Link>
              <Link to="/partner" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Partner werden
              </Link>
              <Link to="/contest" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Gewinnspiel
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-luxury-gold">Rechtliches</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Datenschutz
              </Link>
              <Link to="/terms" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                AGB
              </Link>
              <Link to="/imprint" className="block text-muted-foreground hover:text-luxury-gold transition-colors">
                Impressum
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground">
            © 2025 ALDENAIR. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="https://www.instagram.com/aldenairofficial?igsh=MXZsNjJwM2JrN3A2bQ%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-luxury-gold transition-colors">
              Instagram
            </a>
            <a href="https://www.tiktok.com/@aldenair2?_t=ZN-8zEhtGHdhDi&_r=1" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-luxury-gold transition-colors">
              TikTok
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
