import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerformanceMetric {
  name: string;
  value: number;
  rating?: 'good' | 'needs-improvement' | 'poor';
}

export function usePerformanceMonitor() {
  // Disabled performance monitoring to improve performance
  // This was causing significant lag due to frequent DB writes
  
  const trackCustomMetric = async (metricName: string, value: number) => {
    // Disabled for performance
    return;
  };

  return { trackCustomMetric };
}
