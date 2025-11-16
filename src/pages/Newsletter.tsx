import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { NewsletterSignup } from '@/components/NewsletterSignup';

export default function Newsletter() {
  const navigate = useNavigate();

  return (
    <>
      <Navigation />
      <div className="min-h-screen glass pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Button 
              onClick={() => navigate(-1)}
              variant="outline" 
              className="mb-8"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
            
            <div className="mb-12 text-center">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Newsletter</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Bleiben Sie über neue Düfte, exklusive Angebote und Parfüm-Tipps auf dem Laufenden. 
                Melden Sie sich für unseren Newsletter an und erhalten Sie als Dankeschön 10% Rabatt auf Ihre erste Bestellung.
              </p>
            </div>

            {/* Newsletter Signup Component */}
            <div className="flex justify-center">
              <NewsletterSignup className="w-full max-w-4xl" showIncentive={true} />
            </div>

            {/* Additional Benefits */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎁</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">10% Willkommensrabatt</h3>
                <p className="text-muted-foreground">
                  Erhalten Sie sofort 10% Rabatt auf Ihre erste Bestellung nach der Newsletter-Anmeldung.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">✨</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Exklusive Vorschauen</h3>
                <p className="text-muted-foreground">
                  Seien Sie die Ersten, die über neue Parfüm-Kollektionen und limitierte Editionen erfahren.
                </p>
              </div>

              <div className="space-y-4">
                <div className="w-16 h-16 bg-luxury-gold rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold text-foreground">Experten-Tipps</h3>
                <p className="text-muted-foreground">
                  Erhalten Sie professionelle Beratung zu Duft-Kombinationen, Anwendung und Pflege Ihrer Parfüms.
                </p>
              </div>
            </div>

            {/* Privacy Note */}
            <div className="mt-16 bg-muted/50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Ihre Privatsphäre ist uns wichtig</h3>
              <p className="text-muted-foreground mb-4">
                Wir versenden unseren Newsletter maximal einmal pro Woche und geben Ihre Daten niemals an Dritte weiter. 
                Sie können sich jederzeit mit einem Klick wieder abmelden.
              </p>
              <p className="text-sm text-muted-foreground">
                Weitere Informationen finden Sie in unserer{' '}
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-luxury-gold hover:text-luxury-gold-light"
                  onClick={() => navigate('/privacy')}
                >
                  Datenschutzerklärung
                </Button>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <MobileBottomNav />
    </>
  );
}