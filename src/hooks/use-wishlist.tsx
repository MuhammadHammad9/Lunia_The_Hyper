import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WishlistItem {
  id: string;
  product_id: string | null;
  bundle_id: string | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  tagline: string | null;
  price: number;
  image_url: string;
  badge: string | null;
}

export const useWishlist = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [productIds, setProductIds] = useState<Set<string>>(new Set());

  const fetchWishlist = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setItems([]);
      setProductIds(new Set());
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('wishlist_items')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching wishlist:', error);
    } else {
      setItems(data || []);
      const ids = new Set((data || []).map(item => item.product_id).filter(Boolean) as string[]);
      setProductIds(ids);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWishlist();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchWishlist();
    });

    return () => subscription.unsubscribe();
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId: string) => {
    return productIds.has(productId);
  }, [productIds]);

  const addToWishlist = async (productId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast.error('Please sign in to add items to your wishlist', {
        action: {
          label: 'Sign In',
          onClick: () => {
            window.location.href = '/auth?mode=login';
          },
        },
      });
      return false;
    }

    // Check if already in wishlist
    if (productIds.has(productId)) {
      toast.info('Already in your wishlist');
      return false;
    }

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, product_id: productId });

    if (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return false;
    }

    setProductIds(prev => new Set([...prev, productId]));
    await fetchWishlist();
    toast.success('Added to wishlist');
    return true;
  };

  const removeFromWishlist = async (productId: string): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId);

    if (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }

    setProductIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(productId);
      return newSet;
    });
    await fetchWishlist();
    toast.success('Removed from wishlist');
    return true;
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (isInWishlist(productId)) {
      return removeFromWishlist(productId);
    } else {
      return addToWishlist(productId);
    }
  };

  return {
    items,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    count: items.length,
  };
};
