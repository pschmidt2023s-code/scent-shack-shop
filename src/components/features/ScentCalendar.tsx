import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Sun, Cloud, Snowflake, Leaf, Thermometer, Droplets, Loader2 } from 'lucide-react';

interface ProductVariant {
  id: string;
  name: string;
  price: string;
  size: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  category?: string;
  scentNotes?: string[];
  topNotes?: string[];
  variants?: ProductVariant[];
}

interface DailyRecommendation {
  product: Product | null;
  reason: string;
  weather: string;
  temp: string;
}

const seasonConfig = {
  winter: { icon: Snowflake, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Winter' },
  spring: { icon: Leaf, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Frühling' },
  summer: { icon: Sun, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Sommer' },
  autumn: { icon: Cloud, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Herbst' },
};

const seasonReasons: Record<string, { reason: string; weather: string; temp: string }> = {
  winter: {
    reason: 'Perfekt für kalte Wintertage - wärmende Gewürze und einhüllender Amber',
    weather: 'Kalt & Trocken',
    temp: '-2°C bis 5°C',
  },
  spring: {
    reason: 'Frühlingshaft und lebendig - florale Frische für Neuanfänge',
    weather: 'Mild & Wechselhaft',
    temp: '10°C bis 18°C',
  },
  summer: {
    reason: 'Erfrischend und leicht - ideal für heiße Sommertage',
    weather: 'Warm & Sonnig',
    temp: '25°C bis 32°C',
  },
  autumn: {
    reason: 'Warme Holznoten für die gemütliche Herbstzeit',
    weather: 'Kühl & Neblig',
    temp: '8°C bis 15°C',
  },
};

function getSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

function getProductForDay(products: Product[], dayIndex: number): Product | null {
  if (!products || products.length === 0) return null;
  return products[dayIndex % products.length];
}

export function ScentCalendar() {
  const navigate = useNavigate();
  const [currentDate] = useState(new Date());
  const [season] = useState(getSeason());
  const [weekDays, setWeekDays] = useState<{ day: string; date: number; product: Product | null; isToday: boolean }[]>([]);

  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
  });

  const singlePerfumes = allProducts?.filter(p => {
    const name = p.name.toLowerCase();
    const category = (p.category || '').toLowerCase();
    const isCollection = name.includes('collection') || name.includes('set') || name.includes('sparset') || name.includes('probenset');
    const isBundleCategory = category.includes('bundle') || category.includes('set') || category.includes('collection');
    return !isCollection && !isBundleCategory;
  }) || [];

  const todayProduct = singlePerfumes.length > 0 
    ? singlePerfumes[currentDate.getDate() % singlePerfumes.length] 
    : null;

  const recommendation: DailyRecommendation = {
    product: todayProduct,
    ...seasonReasons[season],
  };

  useEffect(() => {
    if (singlePerfumes.length === 0) return;

    const days = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
    const today = currentDate.getDay();
    const week = [];
    
    for (let i = 0; i < 7; i++) {
      const dayIndex = (today - currentDate.getDay() + i + 7) % 7;
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() - currentDate.getDay() + i);
      
      week.push({
        day: days[dayIndex],
        date: date.getDate(),
        product: getProductForDay(singlePerfumes, date.getDate()),
        isToday: i === currentDate.getDay(),
      });
    }
    
    setWeekDays(week);
  }, [currentDate, singlePerfumes]);

  const SeasonIcon = seasonConfig[season].icon;

  const getNotes = (product: Product | null): string[] => {
    if (!product) return [];
    return product.scentNotes || product.topNotes || [];
  };

  const handleProductClick = (productId: string) => {
    navigate(`/products/${productId}`);
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Duft-Kalender
          </CardTitle>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${seasonConfig[season].bg}`}>
            <SeasonIcon className={`w-4 h-4 ${seasonConfig[season].color}`} />
            <span className="text-xs font-medium">{seasonConfig[season].label}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div 
              className="p-4 rounded-xl bg-primary/5 border border-primary/20 cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => recommendation.product && handleProductClick(recommendation.product.id)}
              data-testid="card-today-recommendation"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Thermometer className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className="font-semibold text-foreground">Heute empfohlen</h4>
                    <Badge variant="secondary" className="text-xs">{recommendation.temp}</Badge>
                  </div>
                  <p className="text-lg font-bold text-primary mb-1">
                    {recommendation.product?.name || 'ALDENAIR Prestige'}
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">{recommendation.reason}</p>
                  {recommendation.product?.variants && recommendation.product.variants.length > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        ab {recommendation.product.variants[0].price}
                      </Badge>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {getNotes(recommendation.product).slice(0, 4).map((note) => (
                      <Badge key={note} variant="outline" className="text-xs">
                        {note}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4" />
                Diese Woche
              </p>
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, i) => (
                  <div 
                    key={i}
                    className={`text-center p-2 rounded-lg transition-colors cursor-pointer ${
                      day.isToday 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                    onClick={() => day.product && handleProductClick(day.product.id)}
                    title={day.product?.name || 'Duft des Tages'}
                    data-testid={`day-${day.day}-${day.date}`}
                  >
                    <p className="text-xs font-medium">{day.day}</p>
                    <p className={`text-lg font-bold ${day.isToday ? '' : 'text-foreground'}`}>{day.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Button 
          variant="outline" 
          className="w-full" 
          onClick={() => navigate('/products')} 
          data-testid="button-discover-weekly"
        >
          Wochenauswahl entdecken
        </Button>
      </CardContent>
    </Card>
  );
}
