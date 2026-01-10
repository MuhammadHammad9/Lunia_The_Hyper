import { useState } from 'react';
import { Star, Heart, ThumbsUp, CheckCircle, User } from 'lucide-react';
import { useReviews, ProductReview } from '@/hooks/use-reviews';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

interface ProductReviewsProps {
  productId: string;
  productName: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => {
  const [hovered, setHovered] = useState(0);
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(star)}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          <Star
            className={`w-5 h-5 ${
              star <= (hovered || rating)
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review, onLike, onHelpful, productName }: { 
  review: ProductReview; 
  onLike: () => void; 
  onHelpful: () => void;
  productName: string;
}) => {
  return (
    <div className="p-4 bg-secondary/30 rounded-xl border border-border/50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">{review.user_name}</span>
              {review.is_verified_purchase && (
                <span className="inline-flex items-center gap-1 text-xs text-primary">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      
      {review.title && (
        <h4 className="font-medium text-foreground mt-3">{review.title}</h4>
      )}
      
      {review.content && (
        <p className="text-foreground/80 text-sm mt-2 leading-relaxed">{review.content}</p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={onLike}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
            review.user_has_liked 
              ? 'bg-red-500/10 text-red-500' 
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
          }`}
        >
          <Heart className={`w-4 h-4 ${review.user_has_liked ? 'fill-current' : ''}`} />
          {review.likes_count || 0}
        </button>
        <button
          onClick={onHelpful}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
            review.user_marked_helpful 
              ? 'bg-primary/10 text-primary' 
              : 'bg-secondary hover:bg-secondary/80 text-muted-foreground'
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${review.user_marked_helpful ? 'fill-current' : ''}`} />
          {review.helpful_count || 0} Helpful
        </button>
      </div>
    </div>
  );
};

const ReviewForm = ({ productId, onSubmit }: { productId: string; onSubmit: () => void }) => {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { createReview } = useReviews(productId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    const success = await createReview({
      product_id: productId,
      rating,
      title: title || undefined,
      content: content || undefined,
    });

    if (success) {
      setRating(0);
      setTitle('');
      setContent('');
      onSubmit();
    }
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-secondary/20 rounded-xl border border-border/50">
      <h4 className="font-medium text-foreground">Write a Review</h4>
      
      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Your Rating *</label>
        <StarRating rating={rating} onRate={setRating} interactive />
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Review Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Summarize your experience"
          className="bg-background"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-2 block">Your Review</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tell others what you think about this product..."
          rows={4}
          className="bg-background resize-none"
        />
      </div>

      <Button type="submit" disabled={rating === 0 || submitting} className="w-full">
        {submitting ? 'Submitting...' : 'Submit Review'}
      </Button>
    </form>
  );
};

export const ProductReviews = ({ productId, productName }: ProductReviewsProps) => {
  const { reviews, loading, averageRating, reviewCount, refetch, likeReview, markHelpful } = useReviews(productId);
  const [showForm, setShowForm] = useState(false);
  
  // Filter to only show approved reviews (moderation happens server-side via RLS)
  const approvedReviews = reviews.filter(r => r.moderation_status === 'approved' || r.moderation_status === 'pending');

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-secondary/50 rounded w-48" />
        <div className="h-24 bg-secondary/50 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-foreground">Customer Reviews</h3>
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-sm text-muted-foreground">
                {averageRating} out of 5 ({reviewCount} review{reviewCount !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        <Button variant="outline" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <ReviewForm productId={productId} onSubmit={() => { setShowForm(false); refetch(); }} />
      )}

      {approvedReviews.length === 0 ? (
        <div className="text-center py-12 bg-secondary/20 rounded-xl">
          <Heart className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review {productName}!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {approvedReviews.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review} 
              productName={productName}
              onLike={() => likeReview(review.id, review.user_id, productName)}
              onHelpful={() => markHelpful(review.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};