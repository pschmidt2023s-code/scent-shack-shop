
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
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
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Datenschutzerklärung</h1>
            <p className="text-luxury-gray text-lg">
              Informationen zum Schutz Ihrer persönlichen Daten
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">Datenschutz bei ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-luxury-gray mb-4">
                Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Datenerhebung und -verwendung</h3>
              <p className="text-luxury-gray mb-4">
                Wir erheben und verwenden personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Kontakt</h3>
              <p className="text-luxury-gray mb-4">
                Bei Fragen zum Datenschutz können Sie uns unter support@aldenairperfumes.de erreichen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
