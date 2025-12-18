export function usePerformanceMonitor() {
  const trackCustomMetric = async (_metricName: string, _value: number) => {
    return;
  };

  return { trackCustomMetric };
}
