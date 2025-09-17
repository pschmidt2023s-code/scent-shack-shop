import { useState, useEffect } from 'react';
import { cachedQuery, optimizedPerfumeQueries } from '@/lib/supabase-optimization';
import type { Perfume } from '@/types/perfume';

interface UseOptimizedPerfumesResult {
  perfumes: Perfume[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Optimized hook for fetching perfume data with caching
 * Reduces database calls and data transfer by using cached results
 */
export function useOptimizedPerfumes(): UseOptimizedPerfumesResult {
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfumes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use cached query to reduce database calls
      const result = await cachedQuery(
        'perfumes-list',
        () => optimizedPerfumeQueries.getPerfumeList(),
        10 // Cache for 10 minutes
      );
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setPerfumes(result.data || []);
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
 * Only fetches full data when needed, uses caching
 */
export function useOptimizedPerfumeDetails(perfumeId: string | undefined) {
  const [perfume, setPerfume] = useState<Perfume | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPerfumeDetails = async () => {
    if (!perfumeId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use cached query with shorter TTL for details
      const result = await cachedQuery(
        `perfume-details-${perfumeId}`,
        () => optimizedPerfumeQueries.getPerfumeDetails(perfumeId),
        5 // Cache for 5 minutes
      );
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setPerfume(result.data);
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
 * Optimized reviews hook with minimal data fetching
 */
export function useOptimizedReviews(perfumeId: string, variantId: string) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use cached query for reviews summary
      const result = await cachedQuery(
        `reviews-${perfumeId}-${variantId}`,
        () => optimizedPerfumeQueries.getReviewsSummary(perfumeId, variantId),
        3 // Cache for 3 minutes (shorter for user content)
      );
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      setReviews(result.data || []);
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