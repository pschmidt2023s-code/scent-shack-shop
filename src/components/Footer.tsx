
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="glass py-12 mt-16 border-t border-border/10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <span className="text-xl font-bold glass-text-dark">ALDENAIR</span>
            <p className="glass-text-dark opacity-80">
              Deine Premium-Destination für exquisite Parfüms und Düfte der Weltklasse.
            </p>
          </div>

          {/* Service */}
          <div className="space-y-4">
            <h3 className="font-semibold glass-text-dark">Service</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Kontakt
              </Link>
              <Link to="/returns" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Rückgabe
              </Link>
              <Link to="/faq" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                FAQ
              </Link>
              <Link to="/newsletter" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Newsletter
              </Link>
              <Link to="/partner" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Partner werden
              </Link>
              <Link to="/contest" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Gewinnspiel
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold glass-text-dark">Rechtliches</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Datenschutz
              </Link>
              <Link to="/terms" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                AGB
              </Link>
              <Link to="/imprint" className="block glass-text-dark opacity-80 hover:opacity-100 hover:text-primary transition-all">
                Impressum
              </Link>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="glass-text-dark opacity-70">
            © {new Date().getFullYear()} ALDENAIR. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}
