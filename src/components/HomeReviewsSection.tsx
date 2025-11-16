import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  created_at: string;
  reviewer_name: string;
}

export function HomeReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchTopReviews();
  }, []);

  const fetchTopReviews = async () => {
    try {
      // Get recent 5-star reviews
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('rating', 5)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      
      // Transform to match interface with anonymous names
      const transformedReviews = (data || []).map((review: any) => ({
        id: review.id,
        rating: review.rating,
        title: review.title || 'Hervorragend',
        content: review.content || '',
        created_at: review.created_at,
        reviewer_name: review.is_verified ? 'Verifizierter Kunde' : 'Kunde',
      }));

      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient-luxury">
            Was unsere Kunden sagen
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Überzeugen Sie sich von der Qualität unserer Parfüms
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-luxury-gold/20">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-luxury-gold text-luxury-black">
                      {review.reviewer_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{review.reviewer_name}</p>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-luxury-gold text-luxury-gold"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">{review.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {review.content}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(review.created_at).toLocaleDateString('de-DE', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
