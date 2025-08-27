
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ChevronDown, HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const faqData = [
  {
    category: "Bestellung & Lieferung",
    questions: [
      {
        question: "Wie lange dauert die Lieferung?",
        answer: "Aufgrund unserer On-Demand-Bestellung beträgt die Lieferzeit 3-7 Werktage. Ihre Parfüms werden frisch für Sie vorbereitet, um höchste Qualität zu gewährleisten."
      },
      {
        question: "In welche Länder liefern Sie?",
        answer: "Wir liefern aktuell innerhalb Deutschlands. Eine Erweiterung auf weitere europäische Länder ist in Planung."
      },
      {
        question: "Fallen Versandkosten an?",
        answer: "Ab einem Bestellwert von 50€ liefern wir versandkostenfrei. Bei Bestellungen unter 50€ berechnen wir 4,90€ Versandkosten."
      },
      {
        question: "Kann ich meine Bestellung verfolgen?",
        answer: "Ja, Sie erhalten nach dem Versand eine Tracking-Nummer per E-Mail, mit der Sie Ihre Sendung verfolgen können."
      }
    ]
  },
  {
    category: "Produkte & Qualität",
    questions: [
      {
        question: "Sind Ihre Parfüms original?",
        answer: "Ja, alle unsere Parfüms sind 100% original und werden direkt von autorisierten Händlern bezogen. Wir garantieren für die Echtheit aller Produkte."
      },
      {
        question: "Wie sollte ich Parfüm richtig lagern?",
        answer: "Lagern Sie Parfüm an einem kühlen, dunklen Ort, fern von direktem Sonnenlicht und Temperaturschwankungen. Das Badezimmer ist nicht ideal aufgrund der Feuchtigkeit."
      },
      {
        question: "Wie lange ist Parfüm haltbar?",
        answer: "Ungeöffnete Parfüms sind in der Regel 3-5 Jahre haltbar. Nach dem Öffnen empfehlen wir die Verwendung innerhalb von 2-3 Jahren für optimale Qualität."
      },
      {
        question: "Bieten Sie Proben an?",
        answer: "Ja, zu jeder Bestellung legen wir gerne kostenlose Proben bei. Sie können auch spezielle Probenpakete in unserem Shop erwerben."
      }
    ]
  },
  {
    category: "Rückgabe & Umtausch",
    questions: [
      {
        question: "Kann ich meine Bestellung zurückgeben?",
        answer: "Ja, Sie haben 14 Tage Rückgaberecht ab Erhalt der Ware. Parfüms müssen ungeöffnet und in originalverpacktem Zustand sein."
      },
      {
        question: "Wie melde ich eine Retoure an?",
        answer: "Nutzen Sie unser Retouren-Formular auf der Website oder kontaktieren Sie uns per E-Mail. Wir senden Ihnen dann ein kostenloses Retourenlabel zu."
      },
      {
        question: "Wann erhalte ich mein Geld zurück?",
        answer: "Nach Eingang und Prüfung Ihrer Retoure erstatten wir den Kaufpreis innerhalb von 5-7 Werktagen auf Ihr ursprüngliches Zahlungsmittel."
      },
      {
        question: "Kann ich umtauschen statt zurückzugeben?",
        answer: "Ja, Umtausch ist möglich. Kontaktieren Sie uns vor dem Rücksendung, damit wir den Umtausch organisieren können."
      }
    ]
  },
  {
    category: "Zahlung & Sicherheit",
    questions: [
      {
        question: "Welche Zahlungsmethoden akzeptieren Sie?",
        answer: "Wir akzeptieren alle gängigen Kreditkarten, PayPal, SEPA-Lastschrift und Sofortüberweisung. Alle Zahlungen werden sicher über Stripe abgewickelt."
      },
      {
        question: "Ist meine Zahlung sicher?",
        answer: "Ja, alle Zahlungen werden über SSL-Verschlüsselung und sichere Zahlungsanbieter wie Stripe abgewickelt. Wir speichern keine Zahlungsdaten."
      },
      {
        question: "Kann ich auf Rechnung kaufen?",
        answer: "Aktuell bieten wir keinen Rechnungskauf an. Sie können aber bequem per Lastschrift oder anderen sicheren Zahlungsmethoden bezahlen."
      }
    ]
  },
  {
    category: "Konto & Service",
    questions: [
      {
        question: "Muss ich ein Konto erstellen?",
        answer: "Ein Konto ist nicht zwingend erforderlich, aber empfohlen. Mit einem Konto können Sie Ihre Bestellungen verwalten, Adressen speichern und exklusive Angebote erhalten."
      },
      {
        question: "Wie kann ich mein Passwort zurücksetzen?",
        answer: "Klicken Sie auf 'Passwort vergessen' auf der Anmeldeseite. Sie erhalten dann eine E-Mail mit Anweisungen zum Zurücksetzen Ihres Passworts."
      },
      {
        question: "Wie erreiche ich den Kundenservice?",
        answer: "Sie können uns per E-Mail unter support@aldenairperfumes.de erreichen oder unser Kontaktformular nutzen. Wir antworten innerhalb von 24 Stunden."
      },
      {
        question: "Gibt es einen Newsletter?",
        answer: "Ja, abonnieren Sie unseren Newsletter für exklusive Angebote, neue Produkte und Parfüm-Tipps. Die Anmeldung finden Sie im Footer unserer Website."
      }
    ]
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
            <HelpCircle className="w-16 h-16 text-luxury-gold mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-luxury-black mb-4">Häufig gestellte Fragen</h1>
            <p className="text-luxury-gray text-lg mb-8">
              Hier finden Sie Antworten auf die häufigsten Fragen zu unserem Service
            </p>
          </div>

          {/* Kontakt-Hinweis */}
          <Card className="mb-8 bg-luxury-gold/10 border-luxury-gold/20">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-luxury-black mb-4">
                  Konnten wir Ihre Frage nicht beantworten?
                </p>
                <Link to="/contact">
                  <Button className="bg-luxury-gold hover:bg-luxury-gold/90 text-luxury-black">
                    Kontaktieren Sie uns
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Kategorien */}
          <div className="space-y-8">
            {filteredFAQ.map((category, categoryIndex) => (
              <Card key={categoryIndex}>
                <CardHeader>
                  <CardTitle className="text-luxury-black text-xl">{category.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="space-y-2">
                    {category.questions.map((faq, faqIndex) => (
                      <AccordionItem 
                        key={faqIndex} 
                        value={`${categoryIndex}-${faqIndex}`}
                        className="border border-gray-200 rounded-lg px-4"
                      >
                        <AccordionTrigger className="text-left hover:no-underline py-4">
                          <span className="font-medium text-luxury-black">{faq.question}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4 pt-0">
                          <p className="text-luxury-gray leading-relaxed">{faq.answer}</p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredFAQ.length === 0 && searchTerm && (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-luxury-gray">
                  Keine Ergebnisse für "{searchTerm}" gefunden.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
