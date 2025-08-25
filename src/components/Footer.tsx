import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-luxury-black text-luxury-light py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-luxury rounded-full"></div>
              <span className="text-xl font-bold text-luxury-gold">LuxeScent</span>
            </div>
            <p className="text-luxury-gray">
              Deine Premium-Destination für exquisite Parfüms und Düfte der Weltklasse.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-4">
            <h3 className="font-semibold text-luxury-gold">Shop</h3>
            <div className="space-y-2">
              <Link to="/perfumes" className="block hover:text-luxury-gold transition-colors">
                Alle Parfüms
              </Link>
              <Link to="/brands" className="block hover:text-luxury-gold transition-colors">
                Marken
              </Link>
              <Link to="/new-arrivals" className="block hover:text-luxury-gold transition-colors">
                Neuheiten
              </Link>
              <Link to="/sale" className="block hover:text-luxury-gold transition-colors">
                Sale
              </Link>
            </div>
          </div>

          {/* Service */}
          <div className="space-y-4">
            <h3 className="font-semibold text-luxury-gold">Service</h3>
            <div className="space-y-2">
              <Link to="/contact" className="block hover:text-luxury-gold transition-colors">
                Kontakt
              </Link>
              <Link to="/shipping" className="block hover:text-luxury-gold transition-colors">
                Versand
              </Link>
              <Link to="/returns" className="block hover:text-luxury-gold transition-colors">
                Rückgabe
              </Link>
              <Link to="/faq" className="block hover:text-luxury-gold transition-colors">
                FAQ
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-luxury-gold">Rechtliches</h3>
            <div className="space-y-2">
              <Link to="/privacy" className="block hover:text-luxury-gold transition-colors">
                Datenschutz
              </Link>
              <Link to="/terms" className="block hover:text-luxury-gold transition-colors">
                AGB
              </Link>
              <Link to="/imprint" className="block hover:text-luxury-gold transition-colors">
                Impressum
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-luxury-gray mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-luxury-gray">
            © 2024 LuxeScent. Alle Rechte vorbehalten.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-luxury-gray hover:text-luxury-gold transition-colors">
              Instagram
            </a>
            <a href="#" className="text-luxury-gray hover:text-luxury-gold transition-colors">
              Facebook
            </a>
            <a href="#" className="text-luxury-gray hover:text-luxury-gold transition-colors">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}