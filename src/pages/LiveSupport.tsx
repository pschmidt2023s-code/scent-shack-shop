import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { LiveSupportQueue } from '@/components/LiveSupportQueue';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveSupport() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen glass pb-20 md:pb-0">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Live Support</h1>
            <p className="text-muted-foreground">
              Unser Support-Team ist für Sie da
            </p>
          </div>

          <LiveSupportQueue />

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-card rounded-lg text-center">
              <div className="text-3xl mb-2">⚡</div>
              <h3 className="font-semibold mb-2">Schnell</h3>
              <p className="text-sm text-muted-foreground">
                Durchschnittliche Antwortzeit von nur 2 Minuten
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold mb-2">Persönlich</h3>
              <p className="text-sm text-muted-foreground">
                Echte Menschen, keine Bots - individuelle Beratung
              </p>
            </div>

            <div className="p-6 bg-card rounded-lg text-center">
              <div className="text-3xl mb-2">💬</div>
              <h3 className="font-semibold mb-2">WhatsApp</h3>
              <p className="text-sm text-muted-foreground">
                Bequem über WhatsApp - dort wo Sie sowieso sind
              </p>
            </div>
          </div>

          <div className="mt-12 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Häufige Fragen</h2>
            <div className="space-y-4">
              <div>
                <p className="font-medium">📦 Wo ist meine Bestellung?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Unser Team hilft Ihnen sofort beim Tracking Ihrer Bestellung
                </p>
              </div>
              <div>
                <p className="font-medium">🔄 Wie funktioniert eine Rücksendung?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Wir führen Sie durch den einfachen Rückgabeprozess
                </p>
              </div>
              <div>
                <p className="font-medium">💳 Zahlungsprobleme?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Sofortige Hilfe bei allen Zahlungsfragen
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
