import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface Metric {
  page_url: string;
  metric_name: string;
  avg_value: number;
  device_type: string;
  count: number;
}

export function PerformanceMetrics() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Feature not yet implemented - using empty data
      setMetrics([]);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricRating = (metricName: string, value: number) => {
    const thresholds: Record<string, { good: number; poor: number }> = {
      'TTFB': { good: 200, poor: 600 },
      'DOM Interactive': { good: 1500, poor: 3000 },
      'Load Complete': { good: 2500, poor: 4000 },
      'first-contentful-paint': { good: 1800, poor: 3000 },
      'largest-contentful-paint': { good: 2500, poor: 4000 },
    };

    const threshold = thresholds[metricName];
    if (!threshold) return 'neutral';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-700';
      case 'needs-improvement':
        return 'bg-yellow-100 text-yellow-700';
      case 'poor':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Performance Monitoring</h2>
        <p className="text-muted-foreground">
          Web Vitals und Ladezeiten der letzten 7 Tage
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">TTFB</span>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Time to First Byte</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">DOM Interactive</span>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">DOM bereit zur Interaktion</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-medium">Load Complete</span>
          </div>
          <p className="text-2xl font-bold">--</p>
          <p className="text-sm text-muted-foreground">Seite vollständig geladen</p>
        </Card>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : metrics.length === 0 ? (
        <Card className="p-8 text-center">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold mb-2">Keine Performance-Daten</h3>
          <p className="text-muted-foreground">
            Performance-Tracking wird noch eingerichtet.
          </p>
        </Card>
      ) : (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Detaillierte Metriken</h3>
          <div className="space-y-4">
            {metrics.map((metric, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">{metric.metric_name}</p>
                  <p className="text-sm text-muted-foreground">{metric.page_url}</p>
                </div>
                <Badge className={getRatingColor(getMetricRating(metric.metric_name, metric.avg_value))}>
                  {metric.avg_value.toFixed(0)}ms
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
