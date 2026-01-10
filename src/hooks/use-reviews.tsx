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
  user_name?: string;
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
      const { data, error } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for the reviews
      const reviewsWithNames = await Promise.all(
        (data || []).map(async (review) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', review.user_id)
            .single();

          return {
            ...review,
            user_name: profile?.full_name || 'Anonymous',
          };
        })
      );

      setReviews(reviewsWithNames);
      
      // Calculate average rating
      if (reviewsWithNames.length > 0) {
        const avg = reviewsWithNames.reduce((sum, r) => sum + r.rating, 0) / reviewsWithNames.length;
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

  return {
    reviews,
    loading,
    averageRating,
    reviewCount: reviews.length,
    createReview,
    deleteReview,
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
