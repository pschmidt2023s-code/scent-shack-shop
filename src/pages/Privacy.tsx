
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { Footer } from '@/components/Footer';

export default function Privacy() {
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
              Datenschutzerklärung
            </h1>
            <p className="text-muted-foreground text-lg">
              Informationen zum Schutz Ihrer persönlichen Daten gemäß DSGVO
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Datenschutz bei ALDENAIR</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none space-y-6">
              <h3 className="text-xl font-semibold">1. Verantwortlicher</h3>
              <p className="text-muted-foreground">
                Verantwortlicher für die Datenverarbeitung auf dieser Website im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:<br />
                Aldenair<br />
                Patric-Maurice Schmidt<br />
                BGM.-Scheller-Str. 14<br />
                96215 Lichtenfels<br />
                Deutschland<br />
                E-Mail: support@aldenairperfumes.de
              </p>
              
              <h3 className="text-xl font-semibold">2. Erhebung und Speicherung personenbezogener Daten</h3>
              <p className="text-muted-foreground">
                Wir erheben und verwenden personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist oder Sie in die Datenerhebung eingewilligt haben.
              </p>
              <p className="text-muted-foreground">
                <strong>Beim Besuch der Website:</strong> Beim Aufrufen unserer Website werden durch den auf Ihrem Endgerät zum Einsatz kommenden Browser automatisch Informationen an den Server unserer Website gesendet. Diese Informationen werden temporär in einem sog. Logfile gespeichert. Folgende Informationen werden dabei ohne Ihr Zutun erfasst und bis zur automatisierten Löschung gespeichert:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>IP-Adresse des anfragenden Rechners</li>
                <li>Datum und Uhrzeit des Zugriffs</li>
                <li>Name und URL der abgerufenen Datei</li>
                <li>Website, von der aus der Zugriff erfolgt (Referrer-URL)</li>
                <li>Verwendeter Browser und ggf. das Betriebssystem Ihres Rechners</li>
              </ul>

              <h3 className="text-xl font-semibold">3. Zwecke der Datenverarbeitung</h3>
              <p className="text-muted-foreground">
                Ihre personenbezogenen Daten werden zu folgenden Zwecken verarbeitet:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li>Abwicklung von Bestellungen und Verträgen (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Kundenservice und Kommunikation (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Versand von Produkten (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Zahlungsabwicklung (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Erfüllung rechtlicher Verpflichtungen (Art. 6 Abs. 1 lit. c DSGVO)</li>
                <li>Marketing und Newsletter bei Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
              </ul>

              <h3 className="text-xl font-semibold">4. Rechtsgrundlagen</h3>
              <p className="text-muted-foreground">
                Die Verarbeitung Ihrer Daten erfolgt auf folgenden Rechtsgrundlagen:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li><strong>Art. 6 Abs. 1 lit. a DSGVO:</strong> Einwilligung (z.B. Newsletter)</li>
                <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung</li>
                <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtungen</li>
                <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigte Interessen</li>
              </ul>

              <h3 className="text-xl font-semibold">5. Speicherdauer</h3>
              <p className="text-muted-foreground">
                Wir speichern Ihre personenbezogenen Daten nur so lange, wie es für die Erfüllung der Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen dies vorsehen:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li><strong>Bestelldaten:</strong> 10 Jahre (steuerrechtliche Aufbewahrungspflicht gemäß § 147 AO, § 257 HGB)</li>
                <li><strong>Rechnungsdaten:</strong> 10 Jahre</li>
                <li><strong>Kundenkonto-Daten:</strong> Bis zur Löschung des Kontos, danach gemäß Aufbewahrungsfristen</li>
                <li><strong>Newsletter-Daten:</strong> Bis zum Widerruf der Einwilligung</li>
                <li><strong>Server-Logfiles:</strong> 7 Tage</li>
              </ul>

              <h3 className="text-xl font-semibold">6. Weitergabe von Daten an Dritte</h3>
              <p className="text-muted-foreground">
                Eine Übermittlung Ihrer persönlichen Daten an Dritte erfolgt nur, soweit dies zur Vertragserfüllung erforderlich ist oder Sie ausdrücklich eingewilligt haben. Wir setzen folgende Dienstleister ein:
              </p>

              <h4 className="text-lg font-semibold">6.1 Zahlungsdienstleister</h4>
              <p className="text-muted-foreground">
                <strong>Stripe, Inc.</strong><br />
                354 Oyster Point Blvd, South San Francisco, CA 94080, USA<br />
                Zweck: Abwicklung von Kreditkartenzahlungen<br />
                Datenschutzerklärung: <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://stripe.com/de/privacy</a>
              </p>
              <p className="text-muted-foreground">
                <strong>PayPal (Europe) S.à r.l. et Cie, S.C.A.</strong><br />
                22-24 Boulevard Royal, L-2449 Luxembourg<br />
                Zweck: Abwicklung von PayPal-Zahlungen<br />
                Datenschutzerklärung: <a href="https://www.paypal.com/de/webapps/mpp/ua/privacy-full" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://www.paypal.com/de/privacy</a>
              </p>

              <h4 className="text-lg font-semibold">6.2 E-Mail-Dienstleister</h4>
              <p className="text-muted-foreground">
                <strong>Resend, Inc.</strong><br />
                548 Market St, PMB 93474, San Francisco, CA 94104, USA<br />
                Zweck: Versand von Transaktions-E-Mails (Bestellbestätigungen, Versandbenachrichtigungen)<br />
                Datenschutzerklärung: <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://resend.com/legal/privacy-policy</a>
              </p>

              <h4 className="text-lg font-semibold">6.3 Hosting und Infrastruktur</h4>
              <p className="text-muted-foreground">
                <strong>Replit, Inc.</strong><br />
                1 Letterman Drive, Suite D4700, San Francisco, CA 94129, USA<br />
                Zweck: Hosting der Website und Datenbank<br />
                Datenschutzerklärung: <a href="https://replit.com/site/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://replit.com/site/privacy</a>
              </p>

              <h4 className="text-lg font-semibold">6.4 KI-Dienste</h4>
              <p className="text-muted-foreground">
                <strong>OpenAI, L.L.C.</strong><br />
                3180 18th St, San Francisco, CA 94110, USA<br />
                Zweck: KI-gestützte Produktbeschreibungen und Duft-Empfehlungen<br />
                Hinweis: Es werden keine personenbezogenen Kundendaten an OpenAI übermittelt. Die KI-Nutzung erfolgt ausschließlich für Produktinformationen.<br />
                Datenschutzerklärung: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://openai.com/policies/privacy-policy</a>
              </p>

              <p className="text-muted-foreground">
                Mit allen genannten Dienstleistern wurden Auftragsverarbeitungsverträge (AVV) gemäß Art. 28 DSGVO geschlossen. Für Übermittlungen in die USA stützen wir uns auf EU-Standardvertragsklauseln.
              </p>

              <h3 className="text-xl font-semibold">7. Ihre Rechte</h3>
              <p className="text-muted-foreground">
                Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li><strong>Auskunft (Art. 15 DSGVO):</strong> Sie haben das Recht, Auskunft über die von uns verarbeiteten personenbezogenen Daten zu verlangen.</li>
                <li><strong>Berichtigung (Art. 16 DSGVO):</strong> Sie haben das Recht, die Berichtigung unrichtiger Daten zu verlangen.</li>
                <li><strong>Löschung (Art. 17 DSGVO):</strong> Sie haben das Recht, die Löschung Ihrer Daten zu verlangen, sofern keine Aufbewahrungspflichten entgegenstehen.</li>
                <li><strong>Einschränkung (Art. 18 DSGVO):</strong> Sie haben das Recht, die Einschränkung der Verarbeitung Ihrer Daten zu verlangen.</li>
                <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Sie haben das Recht, Ihre Daten in einem strukturierten, maschinenlesbaren Format zu erhalten.</li>
                <li><strong>Widerspruch (Art. 21 DSGVO):</strong> Sie haben das Recht, der Verarbeitung Ihrer Daten zu widersprechen.</li>
                <li><strong>Widerruf (Art. 7 Abs. 3 DSGVO):</strong> Sie haben das Recht, eine erteilte Einwilligung jederzeit zu widerrufen.</li>
                <li><strong>Beschwerde (Art. 77 DSGVO):</strong> Sie haben das Recht, sich bei einer Aufsichtsbehörde zu beschweren.</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>Zuständige Aufsichtsbehörde:</strong><br />
                Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
                Promenade 18, 91522 Ansbach<br />
                E-Mail: poststelle@lda.bayern.de
              </p>

              <h3 className="text-xl font-semibold">8. Cookies und Tracking (§ 25 TDDDG)</h3>
              <p className="text-muted-foreground">
                Unsere Website verwendet Cookies. Dabei handelt es sich um kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Einige Cookies sind technisch notwendig, andere dienen der Analyse oder dem Marketing.
              </p>
              <p className="text-muted-foreground">
                <strong>Technisch notwendige Cookies:</strong> Diese Cookies sind für den Betrieb der Website erforderlich und können in unseren Systemen nicht deaktiviert werden. Sie werden in der Regel als Reaktion auf von Ihnen getätigte Aktionen gesetzt (z.B. Warenkorb, Login). Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO.
              </p>
              <p className="text-muted-foreground">
                <strong>Analyse- und Marketing-Cookies:</strong> Diese Cookies werden nur mit Ihrer ausdrücklichen Einwilligung gesetzt (§ 25 TDDDG, Art. 6 Abs. 1 lit. a DSGVO). Sie können Ihre Einwilligung jederzeit über die Cookie-Einstellungen im Footer widerrufen.
              </p>
              <p className="text-muted-foreground">
                Ohne Ihre Einwilligung werden keine nicht-notwendigen Cookies gesetzt. Vorausgefüllte Checkboxen verwenden wir nicht.
              </p>

              <h3 className="text-xl font-semibold">9. Newsletter</h3>
              <p className="text-muted-foreground">
                Wenn Sie unseren Newsletter abonnieren möchten, benötigen wir Ihre E-Mail-Adresse sowie Informationen, die uns die Überprüfung gestatten, dass Sie der Inhaber der angegebenen E-Mail-Adresse sind (Double-Opt-In-Verfahren).
              </p>
              <p className="text-muted-foreground">
                <strong>Ablauf:</strong> Nach Eingabe Ihrer E-Mail-Adresse erhalten Sie eine Bestätigungs-E-Mail mit einem Link. Erst nach Klick auf diesen Link wird Ihre E-Mail-Adresse für den Newsletter-Versand aktiviert.
              </p>
              <p className="text-muted-foreground">
                <strong>Widerruf:</strong> Sie können den Newsletter jederzeit über den Abmeldelink in jeder Newsletter-E-Mail oder per E-Mail an support@aldenairperfumes.de abbestellen.
              </p>
              <p className="text-muted-foreground">
                <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)
              </p>

              <h3 className="text-xl font-semibold">10. SSL/TLS-Verschlüsselung</h3>
              <p className="text-muted-foreground">
                Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von "http://" auf "https://" wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
              </p>

              <h3 className="text-xl font-semibold">11. Einsatz von Künstlicher Intelligenz</h3>
              <p className="text-muted-foreground">
                Wir setzen auf unserer Website KI-gestützte Dienste ein, um Ihnen ein verbessertes Einkaufserlebnis zu bieten:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground">
                <li><strong>Produktbeschreibungen:</strong> Einige Produktbeschreibungen werden mithilfe von KI-Technologie erstellt.</li>
                <li><strong>Chat-Support:</strong> Unser Chat-Assistent nutzt KI zur Beantwortung häufiger Fragen.</li>
                <li><strong>Duft-Finder:</strong> Personalisierte Empfehlungen basieren auf Ihren angegebenen Präferenzen.</li>
              </ul>
              <p className="text-muted-foreground">
                <strong>Wichtig:</strong> Bei der Nutzung dieser Dienste werden keine personenbezogenen Kundendaten an KI-Dienste übermittelt. Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses (Art. 6 Abs. 1 lit. f DSGVO) zur Verbesserung unserer Dienstleistungen.
              </p>

              <h3 className="text-xl font-semibold">12. Kontakt</h3>
              <p className="text-muted-foreground">
                Bei Fragen zum Datenschutz können Sie sich jederzeit an uns wenden:<br />
                E-Mail: support@aldenairperfumes.de<br />
                Post: ALDENAIR, BGM.-Scheller-Str. 14, 96215 Lichtenfels, Deutschland
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
