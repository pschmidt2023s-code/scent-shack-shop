
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Recycle, Battery, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function ShippingInfo() {
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
              Versand und Lieferung
            </h1>
            <p className="text-muted-foreground text-lg">
              Informationen zu Versand, Lieferzeiten und gesetzlichen Hinweisen
            </p>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Versandkosten und Lieferzeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Deutschland</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Ab 50 EUR: <strong className="text-green-600">Kostenloser Versand</strong></li>
                      <li>Unter 50 EUR: 4,90 EUR</li>
                      <li>Lieferzeit: 3-7 Werktage</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">EU-Ausland</h4>
                    <ul className="space-y-1 text-sm">
                      <li>Versandkosten werden im Warenkorb berechnet</li>
                      <li>Lieferzeit: 5-14 Werktage</li>
                    </ul>
                  </div>
                </div>
                <p className="text-sm">
                  <strong>Hinweis:</strong> Bei internationalen Sendungen können ggf. Zollgebühren anfallen, die vom Empfänger zu tragen sind.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Versandpartner
                </CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                <p>
                  Wir versenden mit DHL und DPD. Nach Versand erhalten Sie eine Sendungsverfolgungsnummer per E-Mail, mit der Sie Ihr Paket jederzeit tracken können.
                </p>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Hinweise zum Verpackungsgesetz (VerpackG)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  ALDENAIR ist gemäß Verpackungsgesetz (VerpackG) im Verpackungsregister LUCID registriert.
                </p>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm">
                    <strong>Registrierungsnummer LUCID:</strong><br />
                    <span className="font-mono">DE3211234567890123</span><br />
                    <em className="text-xs">(Beispiel - Bitte mit echter Nummer ersetzen)</em>
                  </p>
                </div>
                <p className="text-sm">
                  Wir nehmen am dualen System zur Entsorgung von Verkaufsverpackungen teil. Unsere Verpackungen sind recycelbar. Bitte entsorgen Sie die Verpackungen ordnungsgemäß über die gelbe Tonne/den gelben Sack (Kunststoff, Metall) bzw. die Papiertonne (Karton, Papier).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Battery className="w-5 h-5" />
                  Hinweise zum Batteriegesetz (BattG)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground mb-2">Hinweis gemäß Batteriegesetz</p>
                      <p className="text-sm">
                        Wir vertreiben derzeit keine Produkte, die Batterien oder Akkus enthalten. Sollten wir zukünftig solche Produkte anbieten, werden wir Sie an dieser Stelle über Ihre Rückgabe- und Entsorgungspflichten informieren.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-sm space-y-2">
                  <p>
                    <strong>Allgemeine Information zum Batteriegesetz:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>Altbatterien dürfen nicht über den Hausmüll entsorgt werden.</li>
                    <li>Verbraucher sind gesetzlich verpflichtet, Altbatterien an einer Sammelstelle der Gemeinde oder im Handel abzugeben.</li>
                    <li>Die Rückgabe gebrauchter Batterien ist unentgeltlich.</li>
                  </ul>
                  <p className="mt-4">
                    <strong>Bedeutung der Symbole:</strong>
                  </p>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Pb</strong> = Batterie enthält Blei</li>
                    <li><strong>Cd</strong> = Batterie enthält Cadmium</li>
                    <li><strong>Hg</strong> = Batterie enthält Quecksilber</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Recycle className="w-5 h-5" />
                  Hinweise zur Entsorgung (WEEE)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Wir vertreiben derzeit keine Elektro- und Elektronikgeräte im Sinne des Elektro- und Elektronikgerätegesetzes (ElektroG). Sollten wir zukünftig solche Produkte anbieten, werden wir Sie über die ordnungsgemäße Entsorgung informieren.
                </p>
                <p className="text-sm">
                  <strong>Hinweis:</strong> Unsere Parfümprodukte sind keine Elektrogeräte und können über den Hausmüll bzw. als Verpackung entsorgt werden.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Produktsicherheit (EU-Verordnung 2023/988)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Gemäß der EU-Produktsicherheitsverordnung teilen wir Ihnen folgende Informationen mit:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-sm">
                  <li><strong>Hersteller:</strong> ALDENAIR, Patric-Maurice Schmidt</li>
                  <li><strong>Anschrift:</strong> BGM.-Scheller-Str. 14, 96215 Lichtenfels, Deutschland</li>
                  <li><strong>Kontakt:</strong> support@aldenairperfumes.de</li>
                </ul>
                <p className="text-sm">
                  Alle unsere Produkte entsprechen den geltenden EU-Sicherheitsvorschriften und werden vor dem Verkauf auf Qualität und Sicherheit geprüft.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
