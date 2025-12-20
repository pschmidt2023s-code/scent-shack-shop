
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Imprint() {
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
              Impressum
            </h1>
            <p className="text-muted-foreground text-lg">
              Rechtliche Angaben gemäß § 5 DDG
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>ALDENAIR - Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <h3 className="text-xl font-semibold">Angaben gemäß § 5 DDG (Digitale-Dienste-Gesetz)</h3>
              <p className="text-muted-foreground">
                Aldenair<br />
                Patric-Maurice Schmidt<br />
                BGM.-Scheller-Str. 14<br />
                96215 Lichtenfels<br />
                Deutschland
              </p>
              
              <h3 className="text-xl font-semibold">Kontakt</h3>
              <p className="text-muted-foreground">
                Telefon: Auf Anfrage per E-Mail<br />
                E-Mail: support@aldenairperfumes.de<br />
                Website: www.aldenairperfumes.de
              </p>

              <h3 className="text-xl font-semibold">Umsatzsteuer-Identifikationsnummer</h3>
              <p className="text-muted-foreground">
                Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:<br />
                <em>Wird bei der Finanzbehörde beantragt / nicht erforderlich (Kleinunternehmerregelung)</em>
              </p>

              <h3 className="text-xl font-semibold">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
              <p className="text-muted-foreground">
                Patric-Maurice Schmidt<br />
                BGM.-Scheller-Str. 14<br />
                96215 Lichtenfels
              </p>

              <h3 className="text-xl font-semibold">EU-Streitschlichtung</h3>
              <p className="text-muted-foreground">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
                <a 
                  href="https://ec.europa.eu/consumers/odr/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary hover:underline"
                >
                  https://ec.europa.eu/consumers/odr/
                </a>
                <br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>
              <p className="text-sm text-muted-foreground italic">
                Hinweis: Die EU-Streitschlichtungsplattform (OS-Plattform) nimmt ab dem 20. März 2025 keine neuen Beschwerden mehr an und wird zum 20. Juli 2025 eingestellt.
              </p>

              <h3 className="text-xl font-semibold">Verbraucherstreitbeilegung / Universalschlichtungsstelle</h3>
              <p className="text-muted-foreground">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>

              <h3 className="text-xl font-semibold">Haftungsausschluss (Disclaimer)</h3>
              
              <h4 className="text-lg font-semibold">Haftung für Inhalte</h4>
              <p className="text-muted-foreground">
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>
              <p className="text-muted-foreground">
                Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
              </p>

              <h4 className="text-lg font-semibold">Haftung für Links</h4>
              <p className="text-muted-foreground">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar.
              </p>
              <p className="text-muted-foreground">
                Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
              </p>

              <h4 className="text-lg font-semibold">Urheberrecht</h4>
              <p className="text-muted-foreground">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet.
              </p>
              <p className="text-muted-foreground">
                Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
              </p>

              <h3 className="text-xl font-semibold">Hinweise zur Produktsicherheit (EU 2023/988)</h3>
              <p className="text-muted-foreground">
                Gemäß der EU-Produktsicherheitsverordnung (EU) 2023/988, gültig ab 13. Dezember 2024:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li><strong>Hersteller:</strong> ALDENAIR, Patric-Maurice Schmidt, BGM.-Scheller-Str. 14, 96215 Lichtenfels, Deutschland</li>
                <li><strong>Verantwortliche Person in der EU:</strong> Patric-Maurice Schmidt (Adresse wie oben)</li>
                <li><strong>Kontakt für Produktsicherheit:</strong> support@aldenairperfumes.de</li>
              </ul>
              <p className="text-muted-foreground">
                Alle Produkte entsprechen den geltenden Sicherheitsvorschriften der Europäischen Union.
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
