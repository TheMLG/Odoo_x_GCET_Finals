import { useState, useEffect } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface ReviewsData {
  reviews: Review[];
  totalReviews: number;
  averageRating: number;
}

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviewsData, setReviewsData] = useState<ReviewsData>({
    reviews: [],
    totalReviews: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const { isAuthenticated, user } = useAuthStore();

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/reviews/${productId}`);
      if (response.data.success) {
        setReviewsData(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      toast.error(error.response?.data?.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add a review');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(
        `${API_URL}/reviews/${productId}`,
        {
          rating,
          comment: comment.trim() || null,
        },
        {
          withCredentials: true,
        }
      );

      if (response.data.success) {
        toast.success('Review added successfully!');
        setRating(0);
        setComment('');
        setShowReviewForm(false);
        fetchReviews(); // Refresh reviews
      }
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.response?.data?.message || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }).map((_, index) => {
      const starValue = index + 1;
      const isFilled = interactive
        ? starValue <= (hoveredRating || rating)
        : starValue <= rating;

      return (
        <Star
          key={index}
          className={cn(
            'h-5 w-5 transition-all',
            isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300',
            interactive && 'cursor-pointer hover:scale-110'
          )}
          onClick={interactive ? () => setRating(starValue) : undefined}
          onMouseEnter={interactive ? () => setHoveredRating(starValue) : undefined}
          onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        />
      );
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-4xl font-bold">
                  {reviewsData.averageRating.toFixed(1)}
                </span>
                <div>
                  <div className="flex gap-1">{renderStars(Math.round(reviewsData.averageRating))}</div>
                  <p className="text-sm text-muted-foreground">
                    Based on {reviewsData.totalReviews} review{reviewsData.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            {isAuthenticated && !showReviewForm && (
              <Button onClick={() => setShowReviewForm(true)} className="rounded-xl">
                Write a Review
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 text-lg font-semibold">Write Your Review</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Your Rating</label>
                <div className="flex gap-1">{renderStars(rating, true)}</div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Your Comment (Optional)</label>
                <Textarea
                  placeholder="Share your experience with this product..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submitting || rating === 0}
                  className="rounded-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowReviewForm(false);
                    setRating(0);
                    setComment('');
                  }}
                  disabled={submitting}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviewsData.reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviewsData.reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                    <span className="font-medium">
                      {review.user.firstName} {review.user.lastName}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDate(review.createdAt)}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-muted-foreground">{review.comment}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
