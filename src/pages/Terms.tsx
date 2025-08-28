
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button 
                variant="luxury" 
                size="lg" 
                className="hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-glow"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zur Startseite
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12 opacity-0 animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <h1 className="text-4xl md:text-5xl font-bold text-luxury-black mb-4 bg-gradient-to-r from-luxury-black via-luxury-gold to-luxury-black bg-clip-text text-transparent">
              Allgemeine Geschäftsbedingungen
            </h1>
            <p className="text-luxury-gray text-lg">
              Unsere AGB für den Kauf bei ALDENAIR
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">AGB ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <h3 className="text-xl font-semibold text-luxury-black">§1 Geltungsbereich</h3>
              <p className="text-luxury-gray">
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Verträge zwischen ALDENAIR und dem Kunden über den Online-Shop. Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn, wir haben ihrer Geltung ausdrücklich schriftlich zugestimmt.
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black">§2 Vertragsschluss</h3>
              <p className="text-luxury-gray">
                Die Darstellung der Produkte in unserem Online-Shop stellt kein rechtlich bindendes Angebot, sondern einen Katalog dar. Mit der Bestellung geben Sie ein verbindliches Angebot zum Kauf der bestellten Ware ab. Der Vertrag kommt durch unsere Annahme Ihres Angebots zustande, die durch Versendung einer Auftragsbestätigung per E-Mail erfolgt.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§3 Preise und Versandkosten</h3>
              <p className="text-luxury-gray">
                Alle Preise verstehen sich inklusive der gesetzlichen Mehrwertsteuer. Zusätzlich zu den angegebenen Produktpreisen kommen Versandkosten hinzu. Versandkostenfrei liefern wir ab einem Bestellwert von 50€. Bei Bestellungen unter 50€ betragen die Versandkosten 4,90€.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§4 Lieferung</h3>
              <p className="text-luxury-gray">
                Die Lieferung erfolgt an die vom Kunden angegebene Adresse. Die Lieferzeit beträgt 3-7 Werktage aufgrund unserer On-Demand-Bestellung. Wir sind berechtigt, Teillieferungen vorzunehmen, sofern dies für den Kunden zumutbar ist.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§5 Zahlung</h3>
              <p className="text-luxury-gray">
                Die Zahlung erfolgt wahlweise per Kreditkarte, PayPal, SEPA-Lastschrift oder Sofortüberweisung. Der Kaufpreis wird mit der Bestellung fällig. Bei Lastschriftverfahren erfolgt die Abbuchung nach Versand der Ware.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§6 Widerrufsrecht</h3>
              <p className="text-luxury-gray">
                Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Waren in Besitz genommen haben. Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung über Ihren Entschluss informieren.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§7 Widerrufsfolgen</h3>
              <p className="text-luxury-gray">
                Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, unverzüglich und spätestens binnen 14 Tagen zurückzuzahlen. Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen 14 Tagen zurückzusenden. Die Waren müssen in originalverpacktem und unbenutztem Zustand sein.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§8 Gewährleistung</h3>
              <p className="text-luxury-gray">
                Es gelten die gesetzlichen Gewährleistungsrechte. Gewährleistungsansprüche verjähren bei neuen Waren in zwei Jahren ab Ablieferung der Ware.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§9 Haftung</h3>
              <p className="text-luxury-gray">
                Wir haften unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer fahrlässigen Pflichtverletzung von uns oder einer vorsätzlichen oder fahrlässigen Pflichtverletzung unserer gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§10 Datenschutz</h3>
              <p className="text-luxury-gray">
                Der Schutz Ihrer persönlichen Daten ist uns wichtig. Einzelheiten zur Verarbeitung Ihrer Daten finden Sie in unserer Datenschutzerklärung.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">§11 Schlussbestimmungen</h3>
              <p className="text-luxury-gray">
                Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Erfüllungsort und Gerichtsstand ist der Sitz unseres Unternehmens. Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Kontakt</h3>
              <p className="text-luxury-gray">
                Bei Fragen zu unseren AGB können Sie uns unter support@aldenairperfumes.de erreichen.
              </p>

              <p className="text-sm text-luxury-gray mt-8">
                Stand: Januar 2025
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
