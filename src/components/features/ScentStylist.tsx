import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Sun, Moon, Cloud, Zap, Heart, Briefcase, PartyPopper, Loader2 } from 'lucide-react';

interface Recommendation {
  name: string;
  description: string;
  notes: string[];
  confidence: number;
}

const moods = [
  { id: 'energetic', label: 'Energiegeladen', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
  { id: 'romantic', label: 'Romantisch', icon: Heart, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  { id: 'professional', label: 'Professionell', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'relaxed', label: 'Entspannt', icon: Cloud, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  { id: 'festive', label: 'Festlich', icon: PartyPopper, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
];

const timeOfDay = [
  { id: 'morning', label: 'Morgen', icon: Sun },
  { id: 'afternoon', label: 'Nachmittag', icon: Sun },
  { id: 'evening', label: 'Abend', icon: Moon },
];

const scentRecommendations: Record<string, Recommendation[]> = {
  'energetic-morning': [
    { name: 'Citrus Explosion', description: 'Ein belebender Mix aus Zitrone, Bergamotte und Grapefruit', notes: ['Zitrus', 'Frisch', 'Grün'], confidence: 95 },
    { name: 'Fresh Start', description: 'Erfrischende Minze mit einem Hauch von grünem Tee', notes: ['Minze', 'Tee', 'Aquatisch'], confidence: 88 },
  ],
  'romantic-evening': [
    { name: 'Velvet Rose', description: 'Sinnliche Rose mit Vanille und Moschus', notes: ['Rose', 'Vanille', 'Moschus'], confidence: 96 },
    { name: 'Midnight Jasmin', description: 'Betörender Jasmin mit orientalischen Akzenten', notes: ['Jasmin', 'Amber', 'Sandelholz'], confidence: 91 },
  ],
  'professional-morning': [
    { name: 'Clean Confidence', description: 'Eleganter Duft mit Bergamotte und weißem Tee', notes: ['Bergamotte', 'Weißer Tee', 'Zeder'], confidence: 94 },
    { name: 'Business Class', description: 'Dezenter Holzduft mit frischen Akzenten', notes: ['Vetiver', 'Bergamotte', 'Leder'], confidence: 89 },
  ],
  'relaxed-afternoon': [
    { name: 'Sunday Breeze', description: 'Leichter Lavendel mit Meeresbrise', notes: ['Lavendel', 'Meersalz', 'Baumwolle'], confidence: 92 },
    { name: 'Zen Garden', description: 'Beruhigender grüner Tee mit Bambusblättern', notes: ['Grüner Tee', 'Bambus', 'Lotusblüte'], confidence: 87 },
  ],
  'festive-evening': [
    { name: 'Golden Celebration', description: 'Opulenter Mix aus Oud, Gold und Champagner-Akkorden', notes: ['Oud', 'Champagner', 'Amber'], confidence: 97 },
    { name: 'Party Nights', description: 'Prickelnde Früchte mit sinnlichem Moschus', notes: ['Himbeere', 'Champagner', 'Moschus'], confidence: 90 },
  ],
};

export function ScentStylist() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const getRecommendations = () => {
    if (!selectedMood || !selectedTime) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const key = `${selectedMood}-${selectedTime}`;
      const recs = scentRecommendations[key] || scentRecommendations['relaxed-afternoon'];
      setRecommendations(recs);
      setShowResults(true);
      setLoading(false);
    }, 1500);
  };

  const reset = () => {
    setSelectedMood(null);
    setSelectedTime(null);
    setRecommendations([]);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Deine Duft-Empfehlungen
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={reset} data-testid="button-reset-stylist">
              Neu starten
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, i) => (
            <div 
              key={i} 
              className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-semibold text-foreground">{rec.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {rec.confidence}% Match
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.notes.map((note) => (
                  <Badge key={note} variant="outline" className="text-xs">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
          <Button className="w-full" onClick={() => window.location.href = '/products'} data-testid="button-discover-scents">
            Diese Düfte entdecken
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Duft-Stylist
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Wähle deine Stimmung und Tageszeit für personalisierte Empfehlungen
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm font-medium mb-3">Wie fühlst du dich heute?</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {moods.map((mood) => (
              <button
                key={mood.id}
                onClick={() => setSelectedMood(mood.id)}
                data-testid={`button-mood-${mood.id}`}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedMood === mood.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <mood.icon className={`w-5 h-5 mb-1 ${mood.color.split(' ').slice(1).join(' ')}`} />
                <span className="text-sm font-medium">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">Für welche Tageszeit?</p>
          <div className="grid grid-cols-3 gap-2">
            {timeOfDay.map((time) => (
              <button
                key={time.id}
                onClick={() => setSelectedTime(time.id)}
                data-testid={`button-time-${time.id}`}
                className={`p-3 rounded-xl border transition-all text-center ${
                  selectedTime === time.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <time.icon className="w-5 h-5 mx-auto mb-1" />
                <span className="text-sm font-medium">{time.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Button 
          className="w-full" 
          disabled={!selectedMood || !selectedTime || loading}
          onClick={getRecommendations}
          data-testid="button-find-scent"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analysiere...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Duft finden
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
