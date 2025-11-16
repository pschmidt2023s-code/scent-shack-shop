import { useState, useEffect } from 'react';
import { Perfume } from '@/types/perfume';

const COMPARISON_KEY = 'aldenair_product_comparison';
const MAX_COMPARISON_ITEMS = 4;

export function useProductComparison() {
  const [comparisonItems, setComparisonItems] = useState<Perfume[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(COMPARISON_KEY);
    if (stored) {
      try {
        setComparisonItems(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading comparison items:', error);
        localStorage.removeItem(COMPARISON_KEY);
      }
    }
  }, []);

  const addToComparison = (perfume: Perfume) => {
    setComparisonItems((prev) => {
      if (prev.find((item) => item.id === perfume.id)) {
        return prev;
      }
      const updated = prev.length >= MAX_COMPARISON_ITEMS 
        ? [...prev.slice(1), perfume]
        : [...prev, perfume];
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeFromComparison = (perfumeId: string) => {
    setComparisonItems((prev) => {
      const updated = prev.filter((item) => item.id !== perfumeId);
      localStorage.setItem(COMPARISON_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearComparison = () => {
    setComparisonItems([]);
    localStorage.removeItem(COMPARISON_KEY);
  };

  const isInComparison = (perfumeId: string) => {
    return comparisonItems.some((item) => item.id === perfumeId);
  };

  return {
    comparisonItems,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonItems.length < MAX_COMPARISON_ITEMS,
  };
}
