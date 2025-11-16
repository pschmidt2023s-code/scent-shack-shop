import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, TrendingDown, Zap, Monitor, Smartphone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

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
      
      // Get aggregated metrics from last 7 days
      const { data, error } = await supabase
        .from('performance_metrics')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Aggregate by page and metric
      const aggregated: Record<string, Metric> = {};
      data?.forEach((m) => {
        const key = `${m.page_url}-${m.metric_name}-${m.device_type}`;
        if (!aggregated[key]) {
          aggregated[key] = {
            page_url: m.page_url,
            metric_name: m.metric_name,
            avg_value: 0,
            device_type: m.device_type || 'unknown',
            count: 0,
          };
        }
        aggregated[key].avg_value += Number(m.metric_value);
        aggregated[key].count += 1;
      });

      const results = Object.values(aggregated).map((m) => ({
        ...m,
        avg_value: m.avg_value / m.count,
      }));

      setMetrics(results);
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

  const topMetrics = metrics
    .filter((m) => ['TTFB', 'DOM Interactive', 'Load Complete'].includes(m.metric_name))
    .slice(0, 6);

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Ø TTFB</p>
              <p className="text-2xl font-bold">
                {(
                  metrics
                    .filter((m) => m.metric_name === 'TTFB')
                    .reduce((sum, m) => sum + m.avg_value, 0) /
                    Math.max(metrics.filter((m) => m.metric_name === 'TTFB').length, 1) || 0
                ).toFixed(0)}
                ms
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Monitor className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Desktop Messungen</p>
              <p className="text-2xl font-bold">
                {metrics.filter((m) => m.device_type === 'desktop').length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Mobile Messungen</p>
              <p className="text-2xl font-bold">
                {metrics.filter((m) => m.device_type === 'mobile').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-4 border-b">
          <h3 className="font-semibold">Key Performance Metrics</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seite</TableHead>
              <TableHead>Metrik</TableHead>
              <TableHead>Gerät</TableHead>
              <TableHead>Ø Wert</TableHead>
              <TableHead>Bewertung</TableHead>
              <TableHead>Messungen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topMetrics.map((metric, index) => {
              const rating = getMetricRating(metric.metric_name, metric.avg_value);
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">{metric.page_url}</TableCell>
                  <TableCell>{metric.metric_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {metric.device_type === 'mobile' ? (
                        <Smartphone className="w-4 h-4" />
                      ) : (
                        <Monitor className="w-4 h-4" />
                      )}
                      <span className="text-sm">{metric.device_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{metric.avg_value.toFixed(0)}ms</TableCell>
                  <TableCell>
                    <Badge className={getRatingColor(rating)}>
                      {rating === 'good' && <TrendingUp className="w-3 h-3 mr-1" />}
                      {rating === 'poor' && <TrendingDown className="w-3 h-3 mr-1" />}
                      {rating === 'good' ? 'Gut' : rating === 'needs-improvement' ? 'OK' : 'Langsam'}
                    </Badge>
                  </TableCell>
                  <TableCell>{metric.count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
