import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertCircle, Clock, Package, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Cancellation() {
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
              Widerrufsbelehrung
            </h1>
            <p className="text-muted-foreground text-lg">
              Ihre Rechte als Verbraucher gemäß § 312g BGB
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            <Card className="border-primary/20">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle>Widerrufsrecht</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Sie haben das Recht, binnen <strong className="text-foreground">vierzehn Tagen</strong> ohne Angabe von Gründen diesen Vertrag zu widerrufen.
                </p>
                <p>
                  Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
                  der nicht der Beförderer ist, die letzte Ware in Besitz genommen haben bzw. hat.
                </p>
                <p>
                  Um Ihr Widerrufsrecht auszuüben, müssen Sie uns mittels einer eindeutigen Erklärung 
                  (z.B. ein mit der Post versandter Brief oder E-Mail) über Ihren Entschluss, 
                  diesen Vertrag zu widerrufen, informieren.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Mail className="w-5 h-5" />
                  </div>
                  <CardTitle>Kontaktdaten für den Widerruf</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-muted-foreground">
                <p className="font-medium text-foreground">ALDENAIR</p>
                <p>Patric-Maurice Schmidt</p>
                <p>BGM.-Scheller-Str. 14</p>
                <p>96215 Lichtenfels</p>
                <p>Deutschland</p>
                <p className="pt-2">E-Mail: support@aldenairperfumes.de</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <CardTitle>Folgen des Widerrufs</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, 
                  einschließlich der Lieferkosten (mit Ausnahme der zusätzlichen Kosten, die sich daraus ergeben, 
                  dass Sie eine andere Art der Lieferung als die von uns angebotene, günstigste Standardlieferung 
                  gewählt haben), unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, 
                  an dem die Mitteilung über Ihren Widerruf dieses Vertrags bei uns eingegangen ist.
                </p>
                <p>
                  Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der ursprünglichen 
                  Transaktion eingesetzt haben, es sei denn, mit Ihnen wurde ausdrücklich etwas anderes vereinbart; 
                  in keinem Fall werden Ihnen wegen dieser Rückzahlung Entgelte berechnet.
                </p>
                <p>
                  Wir können die Rückzahlung verweigern, bis wir die Waren wieder zurückerhalten haben oder bis 
                  Sie den Nachweis erbracht haben, dass Sie die Waren zurückgesandt haben, je nachdem, 
                  welches der frühere Zeitpunkt ist.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <Package className="w-5 h-5" />
                  </div>
                  <CardTitle>Rücksendung der Waren</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Sie haben die Waren unverzüglich und in jedem Fall spätestens binnen vierzehn Tagen ab dem Tag, 
                  an dem Sie uns über den Widerruf dieses Vertrags unterrichten, an uns zurückzusenden oder zu übergeben.
                </p>
                <p>
                  Die Frist ist gewahrt, wenn Sie die Waren vor Ablauf der Frist von vierzehn Tagen absenden.
                </p>
                <p>
                  <strong className="text-foreground">Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.</strong>
                </p>
                <p>
                  Sie müssen für einen etwaigen Wertverlust der Waren nur aufkommen, wenn dieser Wertverlust 
                  auf einen zur Prüfung der Beschaffenheit, Eigenschaften und Funktionsweise der Waren nicht 
                  notwendigen Umgang mit ihnen zurückzuführen ist.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardHeader className="pb-4">
                <CardTitle>Ausschluss des Widerrufsrechts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Das Widerrufsrecht besteht nicht bei Verträgen zur Lieferung von Waren, die aus Gründen des 
                  Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung 
                  nach der Lieferung entfernt wurde.
                </p>
                <p className="font-medium text-foreground">
                  Hinweis: Bei unseren Parfüm-Produkten erlischt das Widerrufsrecht, wenn die Versiegelung 
                  des Produkts geöffnet wurde.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Muster-Widerrufsformular</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Wenn Sie den Vertrag widerrufen wollen, können Sie folgendes Formular verwenden:
              </p>
              <div className="bg-background p-4 rounded-lg text-sm space-y-2">
                <p>An: ALDENAIR, BGM.-Scheller-Str. 14, 96215 Lichtenfels, E-Mail: support@aldenairperfumes.de</p>
                <p>Hiermit widerrufe(n) ich/wir (*) den von mir/uns (*) abgeschlossenen Vertrag über den Kauf der folgenden Waren (*)</p>
                <p>Bestellt am (*) / erhalten am (*): _________________</p>
                <p>Name des/der Verbraucher(s): _________________</p>
                <p>Anschrift des/der Verbraucher(s): _________________</p>
                <p>Datum: _________________</p>
                <p>Unterschrift des/der Verbraucher(s) (nur bei Mitteilung auf Papier): _________________</p>
                <p className="text-xs text-muted-foreground pt-2">(*) Unzutreffendes streichen</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
