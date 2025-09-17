import { useState, useEffect } from 'react';
import { perfumes as staticPerfumes } from '@/data/perfumes';
import type { Perfume } from '@/types/perfume';

interface UseOptimizedPerfumesResult {
  perfumes: Perfume[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Optimized hook for fetching perfume data with caching
 * Uses static data with simulated loading for consistent UX
 */
export function useOptimizedPerfumes(): UseOptimizedPerfumesResult {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Simulate async loading for consistent UX
      await new Promise(resolve => setTimeout(resolve, 100));
      
      setPerfumes(staticPerfumes);
    } catch (err) {
      console.error('Error fetching perfumes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch perfumes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumes();
  }, []);

  return {
    perfumes,
    loading,
    error,
    refetch: fetchPerfumes
  };
}

/**
 * Optimized hook for fetching single perfume details
 * Uses static data with simulated loading
 */
export function useOptimizedPerfumeDetails(perfumeId: string | undefined) {
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfumeDetails = async () => {
    if (!perfumeId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Simulate async loading
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const foundPerfume = staticPerfumes.find(p => p.id === perfumeId);
      setPerfume(foundPerfume || null);
      
      if (!foundPerfume) {
        setError('Perfume not found');
      }
    } catch (err) {
      console.error('Error fetching perfume details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch perfume details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerfumeDetails();
  }, [perfumeId]);

  return {
    perfume,
    loading,
    error,
    refetch: fetchPerfumeDetails
  };
}

/**
 * Optimized reviews hook - uses Supabase for actual review data
 */
export function useOptimizedReviews(perfumeId: string, variantId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since reviews are in Supabase, we can use the actual query
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error: supabaseError } = await supabase
        .from('reviews')
        .select('id, rating, created_at, is_verified, title, content')
        .eq('perfume_id', perfumeId)
        .eq('variant_id', variantId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (supabaseError) {
        throw new Error(supabaseError.message);
      }
      
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [perfumeId, variantId]);

  return {
    reviews,
    loading,
    error,
    refetch: fetchReviews
  };
}