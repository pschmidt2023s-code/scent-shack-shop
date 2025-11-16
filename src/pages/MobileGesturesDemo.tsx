import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { MobileGesturesDemo } from '@/components/MobileGesturesDemo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MobileGesturesDemoPage() {
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

        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Mobile Gestures Demo</h1>
          <p className="text-muted-foreground mb-8">
            Teste die fortgeschrittenen Touch-Gesten auf deinem Smartphone
          </p>

          <MobileGesturesDemo />

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Anleitung:</h2>
            <ul className="space-y-2 text-sm">
              <li>📱 <strong>Am besten auf dem Smartphone testen</strong></li>
              <li>👆 <strong>Swipe Left/Right:</strong> Horizontal wischen</li>
              <li>👆 <strong>Swipe Up/Down:</strong> Vertikal wischen</li>
              <li>🔄 <strong>Pull to Refresh:</strong> Am Seitenanfang nach unten ziehen</li>
              <li>⏱️ <strong>Long Press:</strong> 500ms gedrückt halten</li>
              <li>📳 <strong>Haptic Feedback:</strong> Spüre die Vibrationen bei jeder Geste</li>
            </ul>
          </div>

          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm">
              💡 <strong>Tipp:</strong> Diese Gesten funktionieren bereits auf allen Produktseiten
              und verbessern die Mobile Shopping Experience erheblich!
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
