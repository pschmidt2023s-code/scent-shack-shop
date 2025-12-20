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
  id: string;
  name: string;
  category: string;
  description: string;
  confidence: number;
  notes: string[];
  image?: string;
  variants?: Array<{
    id: string;
    name: string;
    price: string;
    size: string;
  }>;
}

const questions = [
  {
    id: "occasion",
    question: "Für welchen Anlass suchst du einen Duft?",
    options: [
      { value: "daily", label: "Alltag & Büro", description: "Für den täglichen Gebrauch im Berufsleben" },
      { value: "date", label: "Date & Romantik", description: "Verführerische Düfte für besondere Momente" },
      { value: "business", label: "Business & Meeting", description: "Professionelle, seriöse Düfte" },
      { value: "evening", label: "Abend & Party", description: "Ausdrucksstarke Düfte für Events" },
      { value: "sport", label: "Sport & Freizeit", description: "Leichte, erfrischende Düfte" },
    ],
  },
  {
    id: "intensity",
    question: "Welche Duft-Intensität bevorzugst du?",
    options: [
      { value: "light", label: "Leicht & Frisch", description: "Subtil, nicht aufdringlich" },
      { value: "medium", label: "Mittlere Intensität", description: "Ausgewogen und vielseitig" },
      { value: "strong", label: "Stark & Ausdrucksvoll", description: "Präsent und langanhaltend" },
    ],
  },
  {
    id: "season",
    question: "Für welche Jahreszeit?",
    options: [
      { value: "spring", label: "Frühling", description: "Blumig und erneuernd" },
      { value: "summer", label: "Sommer", description: "Leicht und erfrischend" },
      { value: "autumn", label: "Herbst", description: "Warm und würzig" },
      { value: "winter", label: "Winter", description: "Schwer und gemütlich" },
      { value: "all", label: "Ganzjährig", description: "Vielseitig einsetzbar" },
    ],
  },
  {
    id: "gender",
    question: "Für wen ist der Duft?",
    options: [
      { value: "male", label: "Herren", description: "Maskuline Düfte" },
      { value: "female", label: "Damen", description: "Feminine Düfte" },
      { value: "unisex", label: "Unisex", description: "Für alle geeignet" },
    ],
  },
  {
    id: "priceRange",
    question: "Welcher Preisbereich?",
    options: [
      { value: "budget", label: "Bis 30€", description: "Proben und kleine Sets" },
      { value: "mid", label: "30€ - 70€", description: "50ml Flakons" },
      { value: "premium", label: "Über 70€", description: "Premium Sets und Bundles" },
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
                <Card key={index} className="hover:shadow-lg transition-shadow overflow-hidden">
                  {match.image && (
                    <div className="relative h-40 overflow-hidden">
                      <img 
                        src={match.image} 
                        alt={match.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-bold">
                        {match.confidence}% Match
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">{match.name}</CardTitle>
                        <CardDescription>{match.category}</CardDescription>
                      </div>
                      {!match.image && (
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">{match.confidence}%</div>
                          <div className="text-xs text-muted-foreground">Match</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{match.description}</p>
                    {match.notes && match.notes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {match.notes.slice(0, 4).map((note, i) => (
                          <span key={i} className="px-2 py-1 bg-primary/10 rounded-full text-xs">
                            {note}
                          </span>
                        ))}
                      </div>
                    )}
                    {match.variants && match.variants.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Ab </span>
                        <span className="font-bold text-primary">
                          {Math.min(...match.variants.map(v => parseFloat(v.price))).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/product/${match.id}`)}
                      data-testid={`button-view-product-${match.id}`}
                    >
                      Produkt ansehen
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
                        <span className="font-medium">{option.label}</span>
                        {'description' in option && option.description && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            {option.description}
                          </span>
                        )}
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
