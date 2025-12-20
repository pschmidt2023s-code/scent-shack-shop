import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Sparkles, ArrowRight, ArrowLeft } from "lucide-react";
import Navigation from "@/components/Navigation";
import { Footer } from "@/components/Footer";

interface PerfumeMatch {
  name: string;
  category: string;
  description: string;
  confidence: number;
  notes: string[];
}

const questions = [
  {
    id: "occasion",
    question: "Für welchen Anlass suchst du einen Duft?",
    options: [
      { value: "daily", label: "Alltag & Büro" },
      { value: "evening", label: "Abendveranstaltung" },
      { value: "sport", label: "Sport & Freizeit" },
      { value: "special", label: "Besondere Anlässe" },
    ],
  },
  {
    id: "intensity",
    question: "Welche Duft-Intensität bevorzugst du?",
    options: [
      { value: "light", label: "Leicht & Frisch" },
      { value: "medium", label: "Mittlere Intensität" },
      { value: "strong", label: "Stark & Ausdrucksvoll" },
    ],
  },
  {
    id: "season",
    question: "Für welche Jahreszeit?",
    options: [
      { value: "spring", label: "Frühling" },
      { value: "summer", label: "Sommer" },
      { value: "autumn", label: "Herbst" },
      { value: "winter", label: "Winter" },
      { value: "all", label: "Ganzjährig" },
    ],
  },
  {
    id: "gender",
    question: "Für wen ist der Duft?",
    options: [
      { value: "male", label: "Herren" },
      { value: "female", label: "Damen" },
      { value: "unisex", label: "Unisex" },
    ],
  },
  {
    id: "priceRange",
    question: "Welcher Preisbereich?",
    options: [
      { value: "budget", label: "Bis 30€" },
      { value: "mid", label: "30€ - 70€" },
      { value: "premium", label: "Über 70€" },
    ],
  },
];

const notesOptions = [
  { value: "floral", label: "Blumig" },
  { value: "woody", label: "Holzig" },
  { value: "fresh", label: "Frisch" },
  { value: "citrus", label: "Zitrus" },
  { value: "oriental", label: "Oriental" },
  { value: "fruity", label: "Fruchtig" },
  { value: "spicy", label: "Würzig" },
  { value: "sweet", label: "Süß" },
];

const PerfumeFinder = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any>({
    notes: [],
  });
  const [matches, setMatches] = useState<PerfumeMatch[]>([]);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = questions[step];
  const isLastQuestion = step === questions.length - 1;
  const isNotesStep = step === questions.length;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNoteToggle = (value: string) => {
    const currentNotes = answers.notes || [];
    const newNotes = currentNotes.includes(value)
      ? currentNotes.filter((n: string) => n !== value)
      : [...currentNotes, value];
    setAnswers({ ...answers, notes: newNotes });
  };

  const handleNext = () => {
    if (isLastQuestion) {
      setStep(step + 1);
    } else if (isNotesStep) {
      findMatches();
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const findMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/perfume-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        throw new Error('Failed to find matches');
      }

      const data = await response.json();
      setMatches(data.matches || []);
      setExplanation(data.explanation || 'Basierend auf deinen Antworten haben wir folgende Düfte für dich gefunden:');
      setShowResults(true);
    } catch (error: any) {
      console.error("Error finding matches:", error);
      toast.error("Fehler beim Finden der perfekten Düfte. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (isNotesStep) return answers.notes?.length > 0;
    return answers[currentQuestion?.id];
  };

  if (showResults) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
        <Navigation />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl font-bold mb-4">Deine perfekten Düfte</h1>
              <p className="text-muted-foreground">{explanation}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {matches.map((match, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{match.name}</CardTitle>
                        <CardDescription>{match.category}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{match.confidence}%</div>
                        <div className="text-xs text-muted-foreground">Match</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{match.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {match.notes.map((note, i) => (
                        <span key={i} className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                          {note}
                        </span>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => navigate("/products")}>
                      Jetzt entdecken
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 text-center">
              <Button variant="outline" onClick={() => window.location.reload()}>
                Neue Suche starten
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold mb-4">Parfüm Finder</h1>
            <p className="text-muted-foreground">
              Beantworte ein paar Fragen und wir finden den perfekten Duft für dich
            </p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>
                Schritt {step + 1} von {questions.length + 1}
              </span>
              <span>{Math.round(((step + 1) / (questions.length + 1)) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${((step + 1) / (questions.length + 1)) * 100}%` }}
              />
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">
                {isNotesStep ? "Welche Duftnoten magst du?" : currentQuestion?.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isNotesStep ? (
                <div className="grid grid-cols-2 gap-4">
                  {notesOptions.map((note) => (
                    <div key={note.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={note.value}
                        checked={answers.notes?.includes(note.value)}
                        onCheckedChange={() => handleNoteToggle(note.value)}
                      />
                      <Label htmlFor={note.value} className="cursor-pointer">
                        {note.label}
                      </Label>
                    </div>
                  ))}
                </div>
              ) : (
                <RadioGroup
                  value={answers[currentQuestion?.id]}
                  onValueChange={handleAnswer}
                >
                  {currentQuestion?.options.map((option) => (
                    <div
                      key={option.value}
                      className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                    >
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              <div className="flex gap-4 mt-6">
                {step > 0 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Zurück
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={!canProceed() || loading}
                  className="flex-1"
                >
                  {loading ? (
                    "Suche läuft..."
                  ) : isNotesStep ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Perfekte Düfte finden
                    </>
                  ) : (
                    <>
                      Weiter
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PerfumeFinder;
