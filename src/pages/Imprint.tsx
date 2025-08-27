
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
              Rechtliche Angaben zu ALDENAIR
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">ALDENAIR - Impressum</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Angaben gemäß § 5 TMG</h3>
              <p className="text-luxury-gray mb-4">
                ALDENAIR<br />
                [Firmenadresse wird hier eingefügt]<br />
                Deutschland
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Kontakt</h3>
              <p className="text-luxury-gray mb-4">
                E-Mail: support@aldenairperfumes.de
              </p>

              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h3>
              <p className="text-luxury-gray mb-4">
                [Name und Adresse des Verantwortlichen]
              </p>

              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Haftungsausschluss</h3>
              <p className="text-luxury-gray mb-4">
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
