import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export function usePerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;

    const reportMetrics = async (metrics: PerformanceMetric[]) => {
      try {
        const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop';

        const metricsData = metrics.map(metric => ({
          page_url: window.location.pathname,
          metric_name: metric.name,
          metric_value: metric.value,
          user_agent: navigator.userAgent,
          device_type: deviceType,
        }));

        await supabase.from('performance_metrics').insert(metricsData);
      } catch (error) {
        console.error('Error reporting metrics:', error);
      }
    };

    // Collect Web Vitals
    const observer = new PerformanceObserver((list) => {
      const metrics: PerformanceMetric[] = [];

      for (const entry of list.getEntries()) {
        const metric: PerformanceMetric = {
          name: entry.name,
          value: Math.round(entry.startTime),
        };

        // Add rating based on thresholds
        if (entry.entryType === 'largest-contentful-paint') {
          metric.rating = entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs-improvement' : 'poor';
        } else if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          metric.value = Math.round(fid);
          metric.rating = fid < 100 ? 'good' : fid < 300 ? 'needs-improvement' : 'poor';
        }

        metrics.push(metric);
      }

      if (metrics.length > 0) {
        reportMetrics(metrics);
      }
    });

    // Observe different entry types
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    } catch (e) {
      console.warn('Performance observer not supported');
    }

    // Report on page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const metrics: PerformanceMetric[] = [
          {
            name: 'DNS',
            value: Math.round(navigation.domainLookupEnd - navigation.domainLookupStart),
          },
          {
            name: 'TCP',
            value: Math.round(navigation.connectEnd - navigation.connectStart),
          },
          {
            name: 'TTFB',
            value: Math.round(navigation.responseStart - navigation.requestStart),
          },
          {
            name: 'Download',
            value: Math.round(navigation.responseEnd - navigation.responseStart),
          },
          {
            name: 'DOM Interactive',
            value: Math.round(navigation.domInteractive - navigation.fetchStart),
          },
          {
            name: 'DOM Complete',
            value: Math.round(navigation.domComplete - navigation.fetchStart),
          },
          {
            name: 'Load Complete',
            value: Math.round(navigation.loadEventEnd - navigation.fetchStart),
          },
        ];

        // Add paint metrics
        paint.forEach((entry) => {
          metrics.push({
            name: entry.name,
            value: Math.round(entry.startTime),
          });
        });

        reportMetrics(metrics);
      }, 0);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const trackCustomMetric = async (metricName: string, value: number) => {
    try {
      await supabase.from('performance_metrics').insert({
        page_url: window.location.pathname,
        metric_name: metricName,
        metric_value: value,
        user_agent: navigator.userAgent,
        device_type: /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      });
    } catch (error) {
      console.error('Error tracking custom metric:', error);
    }
  };

  return { trackCustomMetric };
}
