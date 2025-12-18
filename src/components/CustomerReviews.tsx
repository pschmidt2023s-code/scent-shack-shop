import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Star, ThumbsUp, ThumbsDown, MoreHorizontal, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ReviewListSkeleton } from './SkeletonComponents'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface Review {
  id: string
  userId: string
  productId: string
  variantId?: string
  rating: number
  title?: string
  content?: string
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: string
  user_vote?: boolean | null
  userName?: string
}

interface CustomerReviewsProps {
  perfumeId: string
  variantId?: string
  className?: string
}

export function CustomerReviews({ perfumeId, variantId, className }: CustomerReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful'>('newest')
  const { user } = useAuth()

  useEffect(() => {
    fetchReviews()
  }, [perfumeId, variantId, sortBy])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/products/${perfumeId}/reviews`)
      
      if (!response.ok) {
        setReviews([])
        return
      }

      const reviewsData = await response.json()

      // Sort reviews based on sortBy
      let sortedReviews = [...(reviewsData || [])]
      switch (sortBy) {
        case 'newest':
          sortedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          break
        case 'oldest':
          sortedReviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case 'highest':
          sortedReviews.sort((a, b) => b.rating - a.rating)
          break
        case 'lowest':
          sortedReviews.sort((a, b) => a.rating - b.rating)
          break
        case 'helpful':
          sortedReviews.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0))
          break
      }

      // Filter by variant if specified
      if (variantId) {
        sortedReviews = sortedReviews.filter(r => r.variantId === variantId)
      }

      setReviews(sortedReviews)
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
      toast({
        title: "Fehler beim Laden der Bewertungen",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (reviewId: string, isHelpful: boolean) => {
    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Bewertungen zu bewerten.",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isHelpful })
      })

      if (!response.ok) {
        throw new Error('Vote failed')
      }

      fetchReviews()
      
      toast({
        title: "Bewertung aktualisiert",
        description: "Ihre Bewertung wurde gespeichert.",
      })
    } catch (error) {
      console.error('Error voting on review:', error)
      toast({
        title: "Fehler beim Bewerten",
        description: "Bitte versuchen Sie es später erneut.",
        variant: "destructive"
      })
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++
    })
    return distribution
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Kundenbewertungen</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewListSkeleton />
        </CardContent>
      </Card>
    )
  }

  const averageRating = getAverageRating()
  const distribution = getRatingDistribution()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Kundenbewertungen ({reviews.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Rating Summary */}
        {reviews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-3xl font-bold">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-sm text-muted-foreground">
                Basierend auf {reviews.length} Bewertung{reviews.length !== 1 ? 'en' : ''}
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}</span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${reviews.length > 0 ? (distribution[rating as keyof typeof distribution] / reviews.length) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {distribution[rating as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground">Sortieren nach:</span>
          {[
            { key: 'newest', label: 'Neueste' },
            { key: 'helpful', label: 'Hilfreichste' },
            { key: 'highest', label: 'Höchste Bewertung' },
            { key: 'lowest', label: 'Niedrigste Bewertung' }
          ].map(option => (
            <Button
              key={option.key}
              variant={sortBy === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => setSortBy(option.key as any)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Noch keine Bewertungen</h3>
            <p className="text-muted-foreground">
              Seien Sie der Erste, der dieses Produkt bewertet!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.userName?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {review.userName || 'Anonymer Kunde'}
                        </span>
                        {review.isVerifiedPurchase && (
                          <Badge variant="secondary" className="text-xs">
                            Verifizierter Kauf
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(review.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('de-DE')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {review.title && (
                  <h4 className="font-semibold">{review.title}</h4>
                )}

                {review.content && (
                  <p className="text-sm leading-relaxed">{review.content}</p>
                )}

                {/* Helpful votes */}
                <div className="flex items-center gap-4 pt-2 border-t">
                  <span className="text-sm text-muted-foreground">
                    War diese Bewertung hilfreich?
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, true)}
                      className={cn(
                        "h-8 px-2",
                        review.user_vote === true && "bg-green-100 text-green-700"
                      )}
                      disabled={!user}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpfulCount || 0}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVote(review.id, false)}
                      className={cn(
                        "h-8 px-2",
                        review.user_vote === false && "bg-red-100 text-red-700"
                      )}
                      disabled={!user}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}