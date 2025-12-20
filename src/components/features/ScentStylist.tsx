import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Sun, Moon, Cloud, Zap, Heart, Briefcase, PartyPopper, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface ProductVariant {
  id: string;
  name: string;
  price: string;
  size: string;
}

interface ProductMatch {
  id: string;
  name: string;
  category: string;
  description: string;
  confidence: number;
  notes: string[];
  image?: string;
  variants?: ProductVariant[];
}

const moods = [
  { id: 'energetic', label: 'Energiegeladen', icon: Zap, color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', occasion: 'sport' },
  { id: 'romantic', label: 'Romantisch', icon: Heart, color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', occasion: 'date' },
  { id: 'professional', label: 'Professionell', icon: Briefcase, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', occasion: 'business' },
  { id: 'relaxed', label: 'Entspannt', icon: Cloud, color: 'bg-green-500/10 text-green-600 dark:text-green-400', occasion: 'daily' },
  { id: 'festive', label: 'Festlich', icon: PartyPopper, color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400', occasion: 'evening' },
];

const timeOfDay = [
  { id: 'morning', label: 'Morgen', icon: Sun, intensity: 'light' },
  { id: 'afternoon', label: 'Nachmittag', icon: Sun, intensity: 'medium' },
  { id: 'evening', label: 'Abend', icon: Moon, intensity: 'strong' },
];

export function ScentStylist() {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<ProductMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendations = async () => {
    if (!selectedMood || !selectedTime) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const mood = moods.find(m => m.id === selectedMood);
      const time = timeOfDay.find(t => t.id === selectedTime);
      
      const answers = {
        occasion: mood?.occasion || 'daily',
        intensity: time?.intensity || 'medium',
        priceRange: 'mid',
        gender: 'unisex',
        notes: [],
      };
      
      const response = await apiRequest<{ matches: ProductMatch[], explanation: string }>('/perfume-finder', {
        method: 'POST',
        body: JSON.stringify({ answers }),
      });
      
      if (response.error) {
        setError('Fehler beim Laden der Empfehlungen. Bitte versuchen Sie es erneut.');
        return;
      }
      
      if (response.data?.matches && response.data.matches.length > 0) {
        setRecommendations(response.data.matches.slice(0, 3));
        setShowResults(true);
      } else {
        setError('Keine passenden Düfte gefunden. Bitte versuchen Sie es erneut.');
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Fehler beim Laden der Empfehlungen. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSelectedMood(null);
    setSelectedTime(null);
    setRecommendations([]);
    setShowResults(false);
    setError(null);
  };

  const handleViewProduct = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  if (showResults) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
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
          {recommendations.map((rec) => (
            <div 
              key={rec.id} 
              className="p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => handleViewProduct(rec.id)}
              data-testid={`card-recommendation-${rec.id}`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h4 className="font-semibold text-foreground">{rec.name}</h4>
                <Badge variant="secondary" className="text-xs">
                  {rec.confidence}% Match
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{rec.description}</p>
              {rec.variants && rec.variants.length > 0 && (
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    ab {rec.variants[0].price}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{rec.variants[0].size}</span>
                </div>
              )}
              {rec.notes && rec.notes.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {rec.notes.slice(0, 3).map((note) => (
                    <Badge key={note} variant="outline" className="text-xs">
                      {note}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Button className="w-full" onClick={() => navigate('/products')} data-testid="button-discover-scents">
            Alle Düfte entdecken
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

        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}

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
