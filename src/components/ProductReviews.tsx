
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star, Upload, MessageCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface Review {
  id: string;
  userId?: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  isVerified: boolean;
  createdAt: string;
  reviewerName?: string;
}

interface ProductReviewsProps {
  perfumeId: string;
  variantId: string;
  perfumeName: string;
}

export function ProductReviews({ perfumeId, variantId, perfumeName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [hasVerifiedPurchase, setHasVerifiedPurchase] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    fetchReviews();
    if (user) {
      checkVerifiedPurchase();
    }
  }, [perfumeId, variantId, user]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${perfumeId}/reviews?variantId=${variantId}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      
      const data = await response.json();
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: "Fehler beim Laden der Bewertungen",
        description: "Bewertungen konnten nicht geladen werden",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkVerifiedPurchase = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/orders/check-purchase?variantId=${variantId}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setHasVerifiedPurchase(data.verified || false);
      }
    } catch (error) {
      console.error('Error checking verified purchase:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    // For now, just simulate upload since we don't have storage set up
    toast({
      title: "Upload simuliert",
      description: "Bildupload-Funktion ist noch nicht konfiguriert.",
    });
    setUploading(false);
  };

  const submitReview = async () => {
    if (!user) return;
    if (rating === 0) {
      toast({
        title: "Bewertung erforderlich",
        description: "Bitte geben Sie eine Sterne-Bewertung ab.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/products/${perfumeId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          variantId,
          rating,
          title: title || null,
          content: content || null,
          images: uploadedImages || [],
          isVerified: hasVerifiedPurchase
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Fehler beim Speichern",
          description: error.message || "Bewertung konnte nicht gespeichert werden",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Bewertung eingereicht",
        description: hasVerifiedPurchase 
          ? "Vielen Dank für Ihre verifizierte Bewertung!"
          : "Vielen Dank für Ihre Bewertung!",
      });
      
      setReviewModalOpen(false);
      resetForm();
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Fehler beim Speichern",
        description: "Ein unerwarteter Fehler ist aufgetreten.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setRating(0);
    setTitle('');
    setContent('');
    setUploadedImages([]);
  };

  const renderStars = (count: number, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count 
            ? 'fill-luxury-gold text-luxury-gold' 
            : 'text-muted-foreground'
        } ${interactive ? 'cursor-pointer hover:text-luxury-gold' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ));
  };

  if (loading) {
    return <div className="text-center py-8">Bewertungen werden geladen...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">Kundenbewertungen</h3>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">{renderStars(Math.floor(averageRating))}</div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} von 5 ({reviews.length} Bewertungen)
              </span>
            </div>
          )}
        </div>

        {user ? (
          <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Bewertung schreiben
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bewertung für {perfumeName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Bewertung *</Label>
                  <div className="flex mt-1">
                    {renderStars(rating, true)}
                  </div>
                </div>

                <div>
                  <Label htmlFor="review-title">Titel</Label>
                  <Input
                    id="review-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kurzer Titel für Ihre Bewertung"
                  />
                </div>

                <div>
                  <Label htmlFor="review-content">Ihre Erfahrung</Label>
                  <Textarea
                    id="review-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Teilen Sie Ihre Erfahrung mit diesem Parfüm..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="review-images">Bilder hochladen</Label>
                  <Input
                    id="review-images"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploadedImages.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {uploadedImages.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Upload ${idx + 1}`}
                          className="w-16 h-16 object-cover rounded border"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={submitReview} className="w-full" disabled={uploading}>
                  {uploading ? 'Bilder werden hochgeladen...' : 'Bewertung veröffentlichen'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <AuthModal>
            <Button className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Bewertung schreiben
            </Button>
          </AuthModal>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Noch keine Bewertungen vorhanden. Seien Sie der Erste!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(review.rating)}</div>
                    <span className="font-semibold">{review.title}</span>
                    {review.isVerified && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 border-green-200">
                        <ShieldCheck className="w-3 h-3 mr-1" />
                        Verifizierter Kauf
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    von {review.reviewerName || 'Anonymer Nutzer'} • {' '}
                    {new Date(review.createdAt).toLocaleDateString('de-DE')}
                  </p>
                </div>
              </div>
              
              {review.content && (
                <p className="text-sm">{review.content}</p>
              )}
              
              {review.images?.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {review.images.map((image, idx) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`Bewertungsbild ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
