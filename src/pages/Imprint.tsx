
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Imprint() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link to="/">
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Impressum</h1>
            <p className="text-luxury-gray text-lg">
              Rechtliche Angaben zu ALDENAIR gemäß §5 TMG
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">ALDENAIR - Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <h3 className="text-xl font-semibold text-luxury-black">Angaben gemäß § 5 TMG</h3>
              <p className="text-luxury-gray">
                ALDENAIR<br />
                [Vollständiger Firmenname]<br />
                [Straße und Hausnummer]<br />
                [PLZ und Ort]<br />
                Deutschland
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black">Vertreten durch</h3>
              <p className="text-luxury-gray">
                [Name des Geschäftsführers/Inhabers]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Kontakt</h3>
              <p className="text-luxury-gray">
                E-Mail: support@aldenairperfumes.de<br />
                Telefon: [Telefonnummer]<br />
                Website: www.aldenairperfumes.de
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Registereintrag</h3>
              <p className="text-luxury-gray">
                Eintragung im Handelsregister.<br />
                Registergericht: [Amtsgericht]<br />
                Registernummer: [HRB-Nummer]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Umsatzsteuer-ID</h3>
              <p className="text-luxury-gray">
                Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                [USt-IdNr.]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Wirtschafts-ID</h3>
              <p className="text-luxury-gray">
                Wirtschafts-Identifikationsnummer: [Wirtschafts-ID]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p className="text-luxury-gray">
                [Name und Anschrift des Verantwortlichen]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">EU-Streitschlichtung</h3>
              <p className="text-luxury-gray">
                Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-luxury-gold hover:underline">
                  https://ec.europa.eu/consumers/odr/
                </a><br />
                Unsere E-Mail-Adresse finden Sie oben im Impressum.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Verbraucherstreitbeilegung/Universalschlichtungsstelle</h3>
              <p className="text-luxury-gray">
                Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">Haftungsausschluss (Disclaimer)</h3>
              
              <h4 className="text-lg font-semibold text-luxury-black">Haftung für Inhalte</h4>
              <p className="text-luxury-gray">
                Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
              </p>

              <h4 className="text-lg font-semibold text-luxury-black">Haftung für Links</h4>
              <p className="text-luxury-gray">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
              </p>

              <h4 className="text-lg font-semibold text-luxury-black">Urheberrecht</h4>
              <p className="text-luxury-gray">
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
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
