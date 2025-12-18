import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback } from './ui/avatar';

interface Review {
  id: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  reviewerName: string;
}

export function HomeReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopReviews();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const fetchTopReviews = async () => {
    try {
      const response = await fetch('/api/reviews/top');
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gradient-luxury glass-text-dark">
            Was unsere Kunden sagen
          </h2>
          <p className="glass-text-dark opacity-80 max-w-2xl mx-auto">
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
                      {review.reviewerName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-sm glass-text-dark">{review.reviewerName}</p>
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
                  <h3 className="font-semibold mb-2 glass-text-dark">{review.title}</h3>
                  <p className="text-sm glass-text-dark opacity-80 line-clamp-3">
                    {review.content}
                  </p>
                </div>
                
                <p className="text-xs text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString('de-DE', {
                    year: 'numeric',
                    month: 'long',
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
