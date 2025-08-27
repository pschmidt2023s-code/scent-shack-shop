
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
              <Button variant="outline" size="sm" className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück
              </Button>
            </Link>
          </div>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Allgemeine Geschäftsbedingungen</h1>
            <p className="text-luxury-gray text-lg">
              Unsere AGB für den Kauf bei ALDENAIR
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">AGB ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">§1 Geltungsbereich</h3>
              <p className="text-luxury-gray mb-4">
                Diese Allgemeinen Geschäftsbedingungen gelten für alle Bestellungen über unseren Online-Shop.
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">§2 Vertragsschluss</h3>
              <p className="text-luxury-gray mb-4">
                Mit der Bestellung geben Sie ein verbindliches Angebot zum Kauf der bestellten Ware ab.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">§3 Widerrufsrecht</h3>
              <p className="text-luxury-gray mb-4">
                Sie haben das Recht, binnen 14 Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black mt-6 mb-3">Kontakt</h3>
              <p className="text-luxury-gray mb-4">
                Bei Fragen zu unseren AGB können Sie uns unter support@aldenairperfumes.de erreichen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
