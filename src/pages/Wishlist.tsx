import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWishlist } from '@/hooks/use-wishlist';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { toast } from 'sonner';

interface WishlistProduct {
  id: string;
  name: string;
  tagline: string | null;
  price: number;
  image_url: string;
  badge: string | null;
}

const Wishlist = () => {
  const [products, setProducts] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { items, removeFromWishlist } = useWishlist();
  const { addItem } = useCart();
  const { playAddToCart, playClick } = useSound();

  useEffect(() => {
    const fetchProducts = async () => {
      if (items.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const productIds = items
        .map(item => item.product_id)
        .filter(Boolean) as string[];

      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('products')
        .select('id, name, tagline, price, image_url, badge')
        .in('id', productIds);

      if (error) {
        console.error('Error fetching products:', error);
      } else {
        setProducts(data || []);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [items]);

  const handleAddToCart = async (product: WishlistProduct) => {
    playClick();
    const success = await addItem({
      id: product.id,
      name: product.name,
      tagline: product.tagline || '',
      price: Number(product.price),
      image: product.image_url,
      badge: product.badge,
    });
    
    if (success) {
      playAddToCart();
      toast.success('Added to cart');
    }
  };

  const handleRemove = async (productId: string) => {
    playClick();
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-2xl text-foreground">
              lunia<span className="text-primary text-xs align-top">™</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Back link */}
        <Link 
          to="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <h1 className="font-display text-4xl text-foreground mb-8 flex items-center gap-3">
          <Heart className="w-8 h-8 text-primary" />
          Your Wishlist
        </h1>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">Save products you love for later</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="group bg-secondary/30 rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {product.badge && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                      {product.badge}
                    </div>
                  )}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-3 right-3 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg text-foreground mb-1">{product.name}</h3>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                    {product.tagline}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">${Number(product.price).toFixed(2)}</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
