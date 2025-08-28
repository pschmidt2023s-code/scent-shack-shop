import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PerfumeRating {
  perfumeId: string;
  averageRating: number;
  totalReviews: number;
  variantRatings: Record<string, { rating: number; count: number }>;
}

export const usePerfumeRatings = (perfumeIds?: string[]) => {
  const [ratings, setRatings] = useState<Record<string, PerfumeRating>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [perfumeIds]);

  const fetchRatings = async () => {
    try {
      let query = supabase
        .from('reviews')
        .select('perfume_id, variant_id, rating');

      if (perfumeIds && perfumeIds.length > 0) {
        query = query.in('perfume_id', perfumeIds);
      }

      const { data: reviews, error } = await query;

      if (error) {
        console.error('Error fetching ratings:', error);
        setLoading(false);
        return;
      }

      if (!reviews) {
        setLoading(false);
        return;
      }

      // Group ratings by perfume
      const ratingsMap: Record<string, PerfumeRating> = {};

      reviews.forEach((review) => {
        if (!ratingsMap[review.perfume_id]) {
          ratingsMap[review.perfume_id] = {
            perfumeId: review.perfume_id,
            averageRating: 0,
            totalReviews: 0,
            variantRatings: {}
          };
        }

        const perfumeRating = ratingsMap[review.perfume_id];
        perfumeRating.totalReviews += 1;

        // Track variant-specific ratings
        if (!perfumeRating.variantRatings[review.variant_id]) {
          perfumeRating.variantRatings[review.variant_id] = {
            rating: 0,
            count: 0
          };
        }

        const variantRating = perfumeRating.variantRatings[review.variant_id];
        variantRating.rating = ((variantRating.rating * variantRating.count) + review.rating) / (variantRating.count + 1);
        variantRating.count += 1;
      });

      // Calculate average ratings for each perfume
      Object.values(ratingsMap).forEach((perfumeRating) => {
        const allRatings = Object.values(perfumeRating.variantRatings);
        if (allRatings.length > 0) {
          const totalRating = allRatings.reduce((sum, variant) => sum + (variant.rating * variant.count), 0);
          const totalCount = allRatings.reduce((sum, variant) => sum + variant.count, 0);
          perfumeRating.averageRating = totalCount > 0 ? totalRating / totalCount : 0;
        }
      });

      setRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingForPerfume = (perfumeId: string) => {
    return ratings[perfumeId] || { 
      perfumeId, 
      averageRating: 0, 
      totalReviews: 0, 
      variantRatings: {} 
    };
  };

  const getRatingForVariant = (perfumeId: string, variantId: string) => {
    const perfumeRating = ratings[perfumeId];
    if (!perfumeRating || !perfumeRating.variantRatings[variantId]) {
      return { rating: 0, count: 0 };
    }
    return perfumeRating.variantRatings[variantId];
  };

  return {
    ratings,
    loading,
    getRatingForPerfume,
    getRatingForVariant,
    refetch: fetchRatings
  };
};