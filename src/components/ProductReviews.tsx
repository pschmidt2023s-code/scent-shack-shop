
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth, supabase } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Star, Upload, MessageCircle } from 'lucide-react';
import { AuthModal } from './AuthModal';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  title: string;
  content: string;
  images: string[];
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

interface ProductReviewsProps {
  perfumeId: string;
  perfumeName: string;
}

export function ProductReviews({ perfumeId, perfumeName }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
    : 0;

  useEffect(() => {
    fetchReviews();
  }, [perfumeId]);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles:user_id (full_name)
      `)
      .eq('perfume_id', perfumeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
    } else {
      setReviews(data || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !user) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('review-images')
        .upload(fileName, file);

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload fehlgeschlagen",
          description: "Bild konnte nicht hochgeladen werden.",
          variant: "destructive",
        });
      } else {
        const { data: urlData } = supabase.storage
          .from('review-images')
          .getPublicUrl(fileName);
        uploadedUrls.push(urlData.publicUrl);
      }
    }

    setUploadedImages([...uploadedImages, ...uploadedUrls]);
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

    const { error } = await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        perfume_id: perfumeId,
        rating,
        title,
        content,
        images: uploadedImages,
      });

    if (error) {
      toast({
        title: "Fehler",
        description: "Bewertung konnte nicht gespeichert werden.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Bewertung eingereicht",
        description: "Vielen Dank für Ihre Bewertung!",
      });
      setReviewModalOpen(false);
      resetForm();
      fetchReviews();
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
                  </div>
                  <p className="text-sm text-muted-foreground">
                    von {review.profiles?.full_name || 'Anonymer Nutzer'} • {' '}
                    {new Date(review.created_at).toLocaleDateString('de-DE')}
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
