import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { products as fallbackProducts } from '@/lib/products';

export interface DatabaseProduct {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  images: string[] | null;
  badge: string | null;
  category_id: string | null;
  sku: string | null;
  stock_quantity: number | null;
  is_active: boolean | null;
  is_featured: boolean | null;
  ingredients: string | null;
  how_to_use: string | null;
  benefits: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface DatabaseBundle {
  id: string;
  name: string;
  tagline: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  image_url: string;
  badge: string | null;
  is_active: boolean | null;
  created_at: string;
}

export interface DatabaseCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number | null;
  created_at: string;
}

// Convert static products to database format for fallback
const convertToDbProduct = (product: typeof fallbackProducts[0]): DatabaseProduct => ({
  id: String(product.id),
  name: product.name,
  tagline: product.tagline,
  description: null,
  price: product.price,
  compare_at_price: null,
  image_url: product.image,
  images: null,
  badge: product.badge,
  category_id: null,
  sku: null,
  stock_quantity: null,
  is_active: true,
  is_featured: true,
  ingredients: null,
  how_to_use: null,
  benefits: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

// Fetch all active products
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async (): Promise<DatabaseProduct[]> => {
      // Return fallback products if Supabase is not configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using fallback products');
        return fallbackProducts.map(convertToDbProduct);
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching products:', error);
          return fallbackProducts.map(convertToDbProduct);
        }

        return data && data.length > 0 ? data : fallbackProducts.map(convertToDbProduct);
      } catch (err) {
        console.error('Error fetching products:', err);
        return fallbackProducts.map(convertToDbProduct);
      }
    },
  });
};

// Fetch featured products only
export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async (): Promise<DatabaseProduct[]> => {
      // Return fallback products if Supabase is not configured
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using fallback products');
        return fallbackProducts.map(convertToDbProduct);
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .eq('is_featured', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching featured products:', error);
          return fallbackProducts.map(convertToDbProduct);
        }

        return data && data.length > 0 ? data : fallbackProducts.map(convertToDbProduct);
      } catch (err) {
        console.error('Error fetching featured products:', err);
        return fallbackProducts.map(convertToDbProduct);
      }
    },
  });
};

// Fetch all active bundles
export const useBundles = () => {
  return useQuery({
    queryKey: ['bundles'],
    queryFn: async (): Promise<DatabaseBundle[]> => {
      const { data, error } = await supabase
        .from('bundles')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bundles:', error);
        throw error;
      }

      return data || [];
    },
  });
};

// Fetch all categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async (): Promise<DatabaseCategory[]> => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data || [];
    },
  });
};

// Fetch a single product by ID
export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<DatabaseProduct | null> => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Helper to convert database product to display format
export const formatProductForDisplay = (product: DatabaseProduct) => ({
  id: product.id,
  name: product.name,
  tagline: product.tagline || '',
  price: Number(product.price),
  image: product.image_url,
  badge: product.badge,
  description: product.description,
  ingredients: product.ingredients,
  benefits: product.benefits,
  images: product.images || [product.image_url],
  stockQuantity: product.stock_quantity,
  isOutOfStock: product.stock_quantity !== null && product.stock_quantity <= 0,
});

export const formatBundleForDisplay = (bundle: DatabaseBundle) => ({
  id: bundle.id,
  name: bundle.name,
  tagline: bundle.tagline || '',
  price: Number(bundle.price),
  compareAtPrice: bundle.compare_at_price ? Number(bundle.compare_at_price) : null,
  image: bundle.image_url,
  badge: bundle.badge,
  description: bundle.description,
});
