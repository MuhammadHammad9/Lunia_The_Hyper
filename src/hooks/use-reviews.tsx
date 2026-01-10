import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProductReview {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  rating: number;
  title: string | null;
  content: string | null;
  is_verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  moderation_status: string;
  user_name?: string;
  likes_count?: number;
  user_has_liked?: boolean;
  helpful_count?: number;
  user_marked_helpful?: boolean;
}

export interface ReviewLike {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

export interface HelpfulVote {
  id: string;
  review_id: string;
  user_id: string;
  created_at: string;
}

interface CreateReviewData {
  product_id: string;
  order_id?: string;
  rating: number;
  title?: string;
  content?: string;
}

export const useReviews = (productId?: string) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const { toast } = useToast();

  const fetchReviews = useCallback(async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles, likes, and helpful votes for the reviews
      const reviewsWithExtras = await Promise.all(
        (data || []).map(async (review) => {
          const [profileRes, likesRes, userLikeRes, helpfulRes, userHelpfulRes] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', review.user_id).single(),
            supabase.from('review_likes').select('id').eq('review_id', review.id),
            user ? supabase.from('review_likes').select('id').eq('review_id', review.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
            supabase.from('helpful_votes').select('id').eq('review_id', review.id),
            user ? supabase.from('helpful_votes').select('id').eq('review_id', review.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null }),
          ]);

          return {
            ...review,
            user_name: profileRes.data?.full_name || 'Anonymous',
            likes_count: likesRes.data?.length || 0,
            user_has_liked: !!userLikeRes.data,
            helpful_count: helpfulRes.data?.length || 0,
            user_marked_helpful: !!userHelpfulRes.data,
          };
        })
      );

      setReviews(reviewsWithExtras);
      
      if (reviewsWithExtras.length > 0) {
        const avg = reviewsWithExtras.reduce((sum, r) => sum + r.rating, 0) / reviewsWithExtras.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const createReview = async (data: CreateReviewData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Sign in required",
          description: "Please sign in to leave a review",
          variant: "destructive",
        });
        return false;
      }

      // Check if user already reviewed this product
      const { data: existingReview } = await supabase
        .from('product_reviews')
        .select('id')
        .eq('user_id', user.id)
        .eq('product_id', data.product_id)
        .single();

      if (existingReview) {
        toast({
          title: "Already reviewed",
          description: "You've already reviewed this product",
          variant: "destructive",
        });
        return false;
      }

      // Check if this is a verified purchase
      let isVerified = false;
      if (data.order_id) {
        const { data: orderItem } = await supabase
          .from('order_items')
          .select('id')
          .eq('order_id', data.order_id)
          .eq('product_id', data.product_id)
          .single();
        isVerified = !!orderItem;
      }

      const { error } = await supabase
        .from('product_reviews')
        .insert({
          user_id: user.id,
          product_id: data.product_id,
          order_id: data.order_id || null,
          rating: data.rating,
          title: data.title || null,
          content: data.content || null,
          is_verified_purchase: isVerified,
        });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      fetchReviews();
      return true;
    } catch (error) {
      console.error('Error creating review:', error);
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      const { error } = await supabase
        .from('product_reviews')
        .delete()
        .eq('id', reviewId);

      if (error) throw error;

      toast({
        title: "Review deleted",
        description: "Your review has been removed",
      });

      fetchReviews();
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
      return false;
    }
  };

  const likeReview = async (reviewId: string, reviewAuthorId: string, productName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to like reviews", variant: "destructive" });
        return false;
      }

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('review_likes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingLike) {
        // Unlike
        await supabase.from('review_likes').delete().eq('id', existingLike.id);
        toast({ title: "Like removed" });
      } else {
        // Like
        await supabase.from('review_likes').insert({ review_id: reviewId, user_id: user.id });
        
        // Send notification to review author (if not self)
        if (reviewAuthorId !== user.id) {
          const [authorProfile, userProfile] = await Promise.all([
            supabase.from('profiles').select('full_name').eq('id', reviewAuthorId).single(),
            supabase.from('profiles').select('full_name').eq('id', user.id).single(),
          ]);
          
          // Get author email from auth
          const { data: authorUser } = await supabase.auth.admin?.getUserById?.(reviewAuthorId) || { data: null };
          
          // Use edge function for notification (email would be fetched server-side in production)
          try {
            await supabase.functions.invoke('send-review-notification', {
              body: {
                type: 'like',
                recipient_email: authorUser?.user?.email || '',
                recipient_name: authorProfile.data?.full_name,
                liker_name: userProfile.data?.full_name || 'Someone',
                product_name: productName,
              }
            });
          } catch (e) {
            console.log('Notification not sent (expected if no admin access)');
          }
        }
        
        toast({ title: "Review liked! ❤️" });
      }

      fetchReviews();
      return true;
    } catch (error) {
      console.error('Error liking review:', error);
      return false;
    }
  };

  const markHelpful = async (reviewId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to mark reviews as helpful", variant: "destructive" });
        return false;
      }

      // Check if already marked helpful
      const { data: existingVote } = await supabase
        .from('helpful_votes')
        .select('id')
        .eq('review_id', reviewId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        // Remove helpful vote
        await supabase.from('helpful_votes').delete().eq('id', existingVote.id);
        toast({ title: "Removed helpful vote" });
      } else {
        // Add helpful vote
        await supabase.from('helpful_votes').insert({ review_id: reviewId, user_id: user.id });
        toast({ title: "Marked as helpful! 👍" });
      }

      fetchReviews();
      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return false;
    }
  };

  return {
    reviews,
    loading,
    averageRating,
    reviewCount: reviews.length,
    createReview,
    deleteReview,
    likeReview,
    markHelpful,
    refetch: fetchReviews,
  };
};

export const useUserReviews = () => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('product_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReviews();
  }, []);

  return { reviews, loading };
};
