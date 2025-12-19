
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
              Datenschutzerklärung
            </h1>
            <p className="text-luxury-gray text-lg">
              Informationen zum Schutz Ihrer persönlichen Daten gemäß DSGVO
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-luxury-black">Datenschutz bei ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <h3 className="text-xl font-semibold text-luxury-black">1. Verantwortlicher</h3>
              <p className="text-luxury-gray">
                Verantwortlicher für die Datenverarbeitung auf dieser Website ist:<br />
                Aldenair<br />
                BGM.-Scheller-Str. 14<br />
                96215 Lichtenfels<br />
                Deutschland<br />
                E-Mail: support@aldenairperfumes.de
              </p>
              
              <h3 className="text-xl font-semibold text-luxury-black">2. Erhebung und Speicherung personenbezogener Daten</h3>
              <p className="text-luxury-gray">
                Wir erheben und verwenden personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist oder gesetzlich zulässig ist.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">3. Zwecke der Datenverarbeitung</h3>
              <p className="text-luxury-gray">
                Ihre personenbezogenen Daten werden zu folgenden Zwecken verarbeitet:
              </p>
              <ul className="list-disc pl-6 text-luxury-gray">
                <li>Abwicklung von Bestellungen und Verträgen</li>
                <li>Kundenservice und Kommunikation</li>
                <li>Versand von Produkten</li>
                <li>Zahlungsabwicklung</li>
                <li>Erfüllung rechtlicher Verpflichtungen</li>
              </ul>

              <h3 className="text-xl font-semibold text-luxury-black">4. Rechtsgrundlage</h3>
              <p className="text-luxury-gray">
                Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b) DSGVO zur Vertragserfüllung, Art. 6 Abs. 1 lit. c) DSGVO zur Erfüllung rechtlicher Verpflichtungen und Art. 6 Abs. 1 lit. f) DSGVO zur Wahrung berechtigter Interessen.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">5. Weitergabe von Daten</h3>
              <p className="text-luxury-gray">
                Eine Übermittlung Ihrer persönlichen Daten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung erforderlich ist (z.B. Versanddienstleister, Zahlungsdienstleister) oder Sie ausdrücklich eingewilligt haben.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">6. Ihre Rechte</h3>
              <p className="text-luxury-gray">
                Sie haben das Recht auf:
              </p>
              <ul className="list-disc pl-6 text-luxury-gray">
                <li>Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
                <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
                <li>Löschung Ihrer Daten (Art. 17 DSGVO)</li>
                <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
                <li>Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)</li>
                <li>Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
              </ul>

              <h3 className="text-xl font-semibold text-luxury-black">7. Cookies</h3>
              <p className="text-luxury-gray">
                Unsere Website verwendet Cookies. Diese dienen dazu, unser Angebot nutzerfreundlicher zu machen. Einige Cookies bleiben auf Ihrem Endgerät gespeichert, bis Sie diese löschen. Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">8. SSL-Verschlüsselung</h3>
              <p className="text-luxury-gray">
                Diese Seite nutzt aus Gründen der Sicherheit und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">9. Einsatz von Künstlicher Intelligenz</h3>
              <p className="text-luxury-gray">
                Wir setzen auf unserer Website KI-gestützte Dienste ein, um Ihnen ein verbessertes Einkaufserlebnis zu bieten:
              </p>
              <ul className="list-disc pl-6 text-luxury-gray">
                <li><strong>Produktbeschreibungen:</strong> Einige Produktbeschreibungen werden mithilfe von KI-Technologie (OpenAI) erstellt, um Ihnen detaillierte Informationen zu unseren Düften zu bieten.</li>
                <li><strong>Chat-Support:</strong> Unser Chat-Assistent nutzt KI, um Ihre Fragen schnell zu beantworten.</li>
                <li><strong>Duft-Finder:</strong> Personalisierte Empfehlungen basieren auf KI-Algorithmen.</li>
              </ul>
              <p className="text-luxury-gray mt-2">
                Bei der Nutzung dieser Dienste werden keine personenbezogenen Daten an Dritte übermittelt, sofern Sie nicht ausdrücklich eingewilligt haben. Die KI-Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) zur Verbesserung unserer Dienstleistungen.
              </p>

              <h3 className="text-xl font-semibold text-luxury-black">10. Kontakt</h3>
              <p className="text-luxury-gray">
                Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:<br />
                E-Mail: support@aldenairperfumes.de
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
