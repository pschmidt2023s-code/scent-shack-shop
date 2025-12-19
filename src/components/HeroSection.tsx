import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.03%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
      
      <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-amber-400/5 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-2">
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-1.5">
                <Star className="w-3.5 h-3.5 mr-1.5 fill-amber-400" />
                Premium Qualitat - Faire Preise
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Luxusdüfte die
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                begeistern
              </span>
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
              Entdecke unsere exklusive Kollektion hochwertiger Parfüms - inspiriert von 
              weltbekannten Luxusmarken, zu Preisen die sich jeder leisten kann.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 font-semibold text-lg px-8 py-6 shadow-lg shadow-amber-500/25"
                asChild
              >
                <Link to="/shop" data-testid="link-shop-cta">
                  Jetzt shoppen
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Truck className="w-5 h-5 text-amber-500" />
                <span className="text-sm">Gratis Versand ab 50 EUR</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Shield className="w-5 h-5 text-amber-500" />
                <span className="text-sm">14 Tage Ruckgabe</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-5 h-5 text-amber-500" />
                <span className="text-sm">1-3 Tage Lieferzeit</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent rounded-3xl blur-2xl" />
              <div className="relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-8 border border-slate-700/50">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/30">
                    <div className="text-3xl font-bold text-amber-500">500+</div>
                    <div className="text-sm text-slate-400 mt-1">Düfte</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/30">
                    <div className="text-3xl font-bold text-amber-500">4.8</div>
                    <div className="text-sm text-slate-400 mt-1">Bewertung</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/30">
                    <div className="text-3xl font-bold text-amber-500">10k+</div>
                    <div className="text-sm text-slate-400 mt-1">Kunden</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/30">
                    <div className="text-3xl font-bold text-amber-500">24h</div>
                    <div className="text-sm text-slate-400 mt-1">Versand</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
