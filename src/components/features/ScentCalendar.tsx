import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Sun, Cloud, Snowflake, Leaf, Thermometer, Droplets } from 'lucide-react';

interface DailyRecommendation {
  perfume: string;
  reason: string;
  notes: string[];
  weather: string;
  temp: string;
}

const seasonConfig = {
  winter: { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  spring: { icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/10' },
  summer: { icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  autumn: { icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-500/10' },
};

function getSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getWeatherBasedRecommendation(season: string): DailyRecommendation {
  const recommendations: Record<string, DailyRecommendation> = {
    winter: {
      perfume: 'Warm Embrace',
      reason: 'Perfekt für kalte Wintertage - wärmende Gewürze und einhüllender Amber',
      notes: ['Zimt', 'Amber', 'Vanille', 'Sandelholz'],
      weather: 'Kalt & Trocken',
      temp: '-2°C bis 5°C',
    },
    spring: {
      perfume: 'Blossom Garden',
      reason: 'Frühlingshaft und lebendig - florale Frische für Neuanfänge',
      notes: ['Kirschblüte', 'Grüner Tee', 'Maiglöckchen'],
      weather: 'Mild & Wechselhaft',
      temp: '10°C bis 18°C',
    },
    summer: {
      perfume: 'Mediterranean Breeze',
      reason: 'Erfrischend und leicht - ideal für heiße Sommertage',
      notes: ['Zitrone', 'Meersalz', 'Weißer Moschus'],
      weather: 'Warm & Sonnig',
      temp: '25°C bis 32°C',
    },
    autumn: {
      perfume: 'Golden Woods',
      reason: 'Warme Holznoten für die gemütliche Herbstzeit',
      notes: ['Zeder', 'Kardamom', 'Tonkabohne'],
      weather: 'Kühl & Neblig',
      temp: '8°C bis 15°C',
    },
  };
  return recommendations[season];
}

export function ScentCalendar() {
  const [currentDate] = useState(new Date());
  const [season] = useState(getSeason());
  const [recommendation] = useState(getWeatherBasedRecommendation(season));
  const [weekDays, setWeekDays] = useState<{ day: string; date: number; perfume: string; isToday: boolean }[]>([]);

  useEffect(() => {
    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const perfumes = ['Fresh Start', 'Business Class', 'Velvet Rose', 'Zen Garden', 'Clean Confidence', 'Party Nights', 'Sunday Breeze'];
    
    const today = currentDate.getDay();
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - currentDate.getDay() + i + 7) % 7;
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDate.getDay() + i);
      
      week.push({
        day: days[dayIndex],
        date: date.getDate(),
        perfume: perfumes[i],
        isToday: i === currentDate.getDay(),
      });
    }
    
    setWeekDays(week);
  }, [currentDate]);

  const SeasonIcon = seasonConfig[season].icon;

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Duft-Kalender
          </CardTitle>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${seasonConfig[season].bg}`}>
            <SeasonIcon className={`w-4 h-4 ${seasonConfig[season].color}`} />
            <span className="text-xs font-medium capitalize">{season === 'winter' ? 'Winter' : season === 'spring' ? 'Frühling' : season === 'summer' ? 'Sommer' : 'Herbst'}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Today's Recommendation */}
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Thermometer className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-foreground">Heute empfohlen</h4>
                <Badge variant="secondary" className="text-xs">{recommendation.temp}</Badge>
              </div>
              <p className="text-lg font-bold text-primary mb-1">{recommendation.perfume}</p>
              <p className="text-sm text-muted-foreground mb-2">{recommendation.reason}</p>
              <div className="flex flex-wrap gap-1.5">
                {recommendation.notes.map((note) => (
                  <Badge key={note} variant="outline" className="text-xs">
                    {note}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Week Overview */}
        <div>
          <p className="text-sm font-medium mb-3 flex items-center gap-2">
            <Droplets className="w-4 h-4" />
            Diese Woche
          </p>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day, i) => (
              <div 
                key={i}
                className={`text-center p-2 rounded-lg transition-colors ${
                  day.isToday 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted/50 hover:bg-muted'
                }`}
              >
                <p className="text-xs font-medium">{day.day}</p>
                <p className={`text-lg font-bold ${day.isToday ? '' : 'text-foreground'}`}>{day.date}</p>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full" onClick={() => window.location.href = '/products'} data-testid="button-discover-weekly">
          Wochenauswahl entdecken
        </Button>
      </CardContent>
    </Card>
  );
}
