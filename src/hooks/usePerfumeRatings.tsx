import { useState, useEffect } from 'react';

interface PerfumeRating {
  perfumeId: string;
  averageRating: number;
  totalReviews: number;
  variantRatings: Record<string, { rating: number; count: number }>;
}

export const usePerfumeRatings = (perfumeIds?: string[]) => {
  const [ratings, setRatings] = useState<Record<string, PerfumeRating>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (perfumeIds && perfumeIds.length > 0) {
      fetchRatings();
    }
  }, [perfumeIds?.join(',')]);

  const fetchRatings = async () => {
    if (!perfumeIds || perfumeIds.length === 0) return;

    try {
      setLoading(true);
      const ratingsMap: Record<string, PerfumeRating> = {};

      await Promise.all(
        perfumeIds.map(async (perfumeId) => {
          try {
            const response = await fetch(`/api/products/${perfumeId}/reviews`, {
              credentials: 'include'
            });

            if (!response.ok) return;

            const reviews = await response.json();
            
            if (!reviews || reviews.length === 0) {
              ratingsMap[perfumeId] = {
                perfumeId,
                averageRating: 0,
                totalReviews: 0,
                variantRatings: {}
              };
              return;
            }

            const variantRatings: Record<string, { rating: number; count: number }> = {};
            let totalRating = 0;

            reviews.forEach((review: any) => {
              totalRating += review.rating;
              
              if (review.variantId) {
                if (!variantRatings[review.variantId]) {
                  variantRatings[review.variantId] = { rating: 0, count: 0 };
                }
                const vr = variantRatings[review.variantId];
                vr.rating = ((vr.rating * vr.count) + review.rating) / (vr.count + 1);
                vr.count += 1;
              }
            });

            ratingsMap[perfumeId] = {
              perfumeId,
              averageRating: totalRating / reviews.length,
              totalReviews: reviews.length,
              variantRatings
            };
          } catch (error) {
            console.error(`Error fetching ratings for ${perfumeId}:`, error);
          }
        })
      );

      setRatings(ratingsMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRatingForPerfume = (perfumeId: string) => {
    return ratings[perfumeId] || { perfumeId, averageRating: 0, totalReviews: 0, variantRatings: {} };
  };

  const getRatingForVariant = (perfumeId: string, variantId: string) => {
    const perfumeRating = ratings[perfumeId];
    if (!perfumeRating || !perfumeRating.variantRatings[variantId]) {
      return { rating: 0, count: 0 };
    }
    return perfumeRating.variantRatings[variantId];
  };

  return { ratings, loading, getRatingForPerfume, getRatingForVariant, refetch: fetchRatings };
};
