
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline" data-testid="button-back-home">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zur Startseite
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Allgemeine Geschäftsbedingungen
            </h1>
            <p className="text-muted-foreground text-lg">
              AGB für den Einkauf bei ALDENAIR
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>AGB ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              
              <h3 className="text-xl font-semibold">§ 1 Geltungsbereich</h3>
              <p className="text-muted-foreground">
                (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Bestellungen und Verträge zwischen ALDENAIR (Inhaber: Patric-Maurice Schmidt, BGM.-Scheller-Str. 14, 96215 Lichtenfels) – nachfolgend "Verkäufer" – und dem Kunden – nachfolgend "Käufer" – über den Online-Shop www.aldenairperfumes.de.
              </p>
              <p className="text-muted-foreground">
                (2) Abweichende Bedingungen des Käufers werden nicht anerkannt, es sei denn, der Verkäufer hat ihrer Geltung ausdrücklich schriftlich zugestimmt.
              </p>
              <p className="text-muted-foreground">
                (3) Für die Geschäftsbeziehung zwischen Verkäufer und Käufer gilt die zum Zeitpunkt der Bestellung gültige Fassung der AGB.
              </p>

              <h3 className="text-xl font-semibold">§ 2 Vertragsschluss</h3>
              <p className="text-muted-foreground">
                (1) Die Darstellung der Produkte im Online-Shop stellt kein rechtlich bindendes Angebot, sondern eine Aufforderung zur Bestellung (invitatio ad offerendum) dar.
              </p>
              <p className="text-muted-foreground">
                (2) Mit dem Absenden der Bestellung durch Klick auf den Button "Kostenpflichtig bestellen" gibt der Käufer ein verbindliches Angebot zum Kauf der bestellten Ware ab (§ 312j Abs. 3 BGB).
              </p>
              <p className="text-muted-foreground">
                (3) Der Verkäufer bestätigt den Eingang der Bestellung unverzüglich per E-Mail (Eingangsbestätigung). Diese Eingangsbestätigung stellt noch keine Annahme des Angebots dar.
              </p>
              <p className="text-muted-foreground">
                (4) Der Vertrag kommt zustande durch Versendung der Auftragsbestätigung per E-Mail oder durch Lieferung der Ware.
              </p>

              <h3 className="text-xl font-semibold">§ 3 Preise und Versandkosten</h3>
              <p className="text-muted-foreground">
                (1) Alle angegebenen Preise sind Endpreise und enthalten die gesetzliche Mehrwertsteuer (derzeit 19% MwSt.).
              </p>
              <p className="text-muted-foreground">
                (2) Zusätzlich zu den angegebenen Produktpreisen fallen Versandkosten an. Die Höhe der Versandkosten wird dem Käufer vor Abschluss der Bestellung angezeigt:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Versandkostenfrei ab einem Bestellwert von 50 EUR (Lieferung innerhalb Deutschlands)</li>
                <li>Bestellungen unter 50 EUR: 4,90 EUR Versandkosten</li>
                <li>Lieferung in andere EU-Länder: Versandkosten werden im Warenkorb angezeigt</li>
              </ul>
              <p className="text-muted-foreground">
                (3) Es gibt keine versteckten Kosten. Alle Preise sind transparent vor Bestellabschluss ersichtlich.
              </p>

              <h3 className="text-xl font-semibold">§ 4 Lieferung</h3>
              <p className="text-muted-foreground">
                (1) Die Lieferung erfolgt an die vom Käufer angegebene Lieferadresse.
              </p>
              <p className="text-muted-foreground">
                (2) Die Lieferzeit beträgt in der Regel 3-7 Werktage innerhalb Deutschlands. Bei Lieferungen ins Ausland kann die Lieferzeit länger betragen.
              </p>
              <p className="text-muted-foreground">
                (3) Sollte die bestellte Ware nicht verfügbar sein, behält sich der Verkäufer das Recht vor, nicht zu liefern. In diesem Fall wird der Käufer unverzüglich informiert und bereits geleistete Zahlungen werden erstattet.
              </p>
              <p className="text-muted-foreground">
                (4) Der Verkäufer ist zu Teillieferungen berechtigt, soweit dies für den Käufer zumutbar ist.
              </p>

              <h3 className="text-xl font-semibold">§ 5 Zahlung</h3>
              <p className="text-muted-foreground">
                (1) Der Käufer hat folgende Zahlungsmöglichkeiten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Kreditkarte (Visa, Mastercard, American Express)</li>
                <li>PayPal</li>
                <li>SEPA-Lastschrift</li>
                <li>Sofortüberweisung (Klarna)</li>
              </ul>
              <p className="text-muted-foreground">
                (2) Die Zahlung erfolgt vor Lieferung der Ware. Der Kaufpreis ist mit Bestellabschluss fällig.
              </p>
              <p className="text-muted-foreground">
                (3) Die Zahlungsabwicklung erfolgt über sichere, verschlüsselte Verbindungen unserer Zahlungsdienstleister (Stripe, PayPal).
              </p>

              <h3 className="text-xl font-semibold">§ 6 Widerrufsrecht</h3>
              <p className="text-muted-foreground">
                (1) Verbraucher haben ein 14-tägiges Widerrufsrecht gemäß §§ 312g, 355 BGB. Die vollständige Widerrufsbelehrung finden Sie unter{' '}
                <Link to="/widerruf" className="text-primary hover:underline">Widerrufsbelehrung</Link>.
              </p>
              <p className="text-muted-foreground">
                (2) <strong>Ausschluss des Widerrufsrechts:</strong> Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung versiegelter Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde (§ 312g Abs. 2 Nr. 3 BGB). Dies gilt insbesondere für entsiegelte Parfümflakons.
              </p>
              <p className="text-muted-foreground">
                (3) Die Kosten der Rücksendung trägt der Käufer, sofern die gelieferte Ware der bestellten entspricht.
              </p>

              <h3 className="text-xl font-semibold">§ 7 Eigentumsvorbehalt</h3>
              <p className="text-muted-foreground">
                Die gelieferte Ware bleibt bis zur vollständigen Bezahlung Eigentum des Verkäufers.
              </p>

              <h3 className="text-xl font-semibold">§ 8 Gewährleistung</h3>
              <p className="text-muted-foreground">
                (1) Es gelten die gesetzlichen Gewährleistungsrechte gemäß §§ 434 ff. BGB.
              </p>
              <p className="text-muted-foreground">
                (2) Die Gewährleistungsfrist für neue Waren beträgt zwei Jahre ab Ablieferung der Ware.
              </p>
              <p className="text-muted-foreground">
                (3) Mängel sind dem Verkäufer unverzüglich, spätestens jedoch innerhalb von 14 Tagen nach Entdeckung, anzuzeigen.
              </p>

              <h3 className="text-xl font-semibold">§ 9 Haftung</h3>
              <p className="text-muted-foreground">
                (1) Der Verkäufer haftet unbeschränkt für Schäden aus der Verletzung des Lebens, des Körpers oder der Gesundheit, die auf einer vorsätzlichen oder fahrlässigen Pflichtverletzung des Verkäufers oder seiner gesetzlichen Vertreter oder Erfüllungsgehilfen beruhen.
              </p>
              <p className="text-muted-foreground">
                (2) Für sonstige Schäden haftet der Verkäufer nur bei vorsätzlicher oder grob fahrlässiger Pflichtverletzung sowie bei der Verletzung wesentlicher Vertragspflichten.
              </p>
              <p className="text-muted-foreground">
                (3) Die vorstehenden Haftungsbeschränkungen gelten nicht für Ansprüche aus dem Produkthaftungsgesetz.
              </p>

              <h3 className="text-xl font-semibold">§ 10 Datenschutz</h3>
              <p className="text-muted-foreground">
                Der Schutz Ihrer persönlichen Daten ist uns wichtig. Informationen zur Verarbeitung Ihrer Daten finden Sie in unserer{' '}
                <Link to="/privacy" className="text-primary hover:underline">Datenschutzerklärung</Link>.
              </p>

              <h3 className="text-xl font-semibold">§ 11 Online-Streitbeilegung</h3>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a>
              </p>
              <p className="text-muted-foreground">
                Unsere E-Mail-Adresse: support@aldenairperfumes.de
              </p>
              <p className="text-sm text-muted-foreground italic">
                Hinweis: Die EU-OS-Plattform nimmt ab 20.03.2025 keine neuen Beschwerden mehr an und wird zum 20.07.2025 eingestellt.
              </p>
              <p className="text-muted-foreground">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>

              <h3 className="text-xl font-semibold">§ 12 Schlussbestimmungen</h3>
              <p className="text-muted-foreground">
                (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts (CISG).
              </p>
              <p className="text-muted-foreground">
                (2) Erfüllungsort ist der Sitz des Verkäufers.
              </p>
              <p className="text-muted-foreground">
                (3) Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, der Sitz des Verkäufers.
              </p>
              <p className="text-muted-foreground">
                (4) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen davon unberührt. Anstelle der unwirksamen Bestimmung gilt die gesetzliche Regelung.
              </p>

              <div className="border-t pt-6 mt-8">
                <h3 className="text-xl font-semibold">Besondere Bedingungen: Gewinnspiele</h3>
                
                <h4 className="text-lg font-semibold mt-4">§ G1 Teilnahmeberechtigung</h4>
                <p className="text-muted-foreground">
                  Teilnahmeberechtigt an Gewinnspielen sind ausschließlich natürliche Personen, die das 18. Lebensjahr vollendet haben und einen Wohnsitz in Deutschland haben. Jede Person darf nur einmal teilnehmen. Mitarbeiter des Verkäufers und deren Angehörige sind von der Teilnahme ausgeschlossen.
                </p>

                <h4 className="text-lg font-semibold mt-4">§ G2 Teilnahme und Altersverifikation</h4>
                <p className="text-muted-foreground">
                  Die Teilnahme erfolgt durch vollständiges Ausfüllen des Gewinnspiel-Formulars. Zur Teilnahme kann eine Altersverifikation erforderlich sein. Hochgeladene Ausweisdokumente werden ausschließlich zur Altersverifikation verwendet und nicht dauerhaft gespeichert.
                </p>

                <h4 className="text-lg font-semibold mt-4">§ G3 Gewinnermittlung und Gewinne</h4>
                <p className="text-muted-foreground">
                  Die Gewinner werden nach Ende des Gewinnspiels per Zufallsverfahren ermittelt und per E-Mail benachrichtigt. Eine Barauszahlung ist nicht möglich. Der Rechtsweg ist ausgeschlossen. Der Verkäufer behält sich das Recht vor, Gewinnspiele jederzeit zu beenden oder zu ändern.
                </p>
              </div>

              <h3 className="text-xl font-semibold">Kontakt</h3>
              <p className="text-muted-foreground">
                Bei Fragen zu unseren AGB erreichen Sie uns unter:<br />
                E-Mail: support@aldenairperfumes.de
              </p>

              <p className="text-sm text-muted-foreground mt-8">
                Stand: Dezember 2024
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
