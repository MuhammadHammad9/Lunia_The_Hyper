import { useState, forwardRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { useProductModal } from '@/hooks/use-product-modal';
import { useWishlist } from '@/hooks/use-wishlist';
import { Check, Heart } from 'lucide-react';
import { DisplayProduct } from '@/types/product';

export type { DisplayProduct };

interface ProductCardProps {
  product: DisplayProduct;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product }, ref) => {
    const { addItem } = useCart();
    const { playAddToCart, playHover, playClick } = useSound();
    const { openModal } = useProductModal();
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    const productId = String(product.id);
    const inWishlist = isInWishlist(productId);
    const isOutOfStock = product.isOutOfStock || product.badge === 'Out of Stock';

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isAdding || isOutOfStock) return;
      
      setIsAdding(true);
      const success = await addItem({
        id: product.id,
        name: product.name,
        tagline: product.tagline,
        price: product.price,
        image: product.image,
        badge: product.badge,
      });
      
      if (success) {
        playAddToCart();
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }
      setIsAdding(false);
    };

    const handleCardClick = () => {
      playClick();
      openModal(product);
    };

    const handleWishlistClick = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isWishlistLoading) return;
      
      setIsWishlistLoading(true);
      playClick();
      await toggleWishlist(productId);
      setIsWishlistLoading(false);
    };

    // Fallback images for different product types
    const getFallbackImage = () => {
      const fallbacks = [
        'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1570194065650-d99fb4d38c8a?q=80&w=800&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
      ];
      const index = typeof product.id === 'number' ? product.id : product.id.charCodeAt(0);
      return fallbacks[index % fallbacks.length];
    };

    return (
      <div 
        ref={ref}
        className="group cursor-pointer hover-trigger"
        onMouseEnter={playHover}
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick();
          }
        }}
        aria-label={`View ${product.name} details`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl mb-6 bg-secondary card-shine border border-transparent dark:border-white/5 group-hover:border-primary/20 transition-all duration-500">
          <img
            src={imageError ? getFallbackImage() : product.image}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            alt={`${product.name} - ${product.tagline}`}
            loading="lazy"
            onError={() => setImageError(true)}
          />
          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {product.badge && (
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full z-10 bg-primary text-primary-foreground shadow-lg">
              <span className="text-[10px] uppercase tracking-widest font-bold">
                {product.badge}
              </span>
            </div>
          )}
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            disabled={isWishlistLoading}
            className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
              inWishlist 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-background/80 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground'
            } ${isWishlistLoading ? 'opacity-50' : ''}`}
            aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`absolute bottom-6 left-1/2 -translate-x-1/2 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 px-6 py-3 rounded-full font-medium text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-xl ${
              isOutOfStock
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : added 
                  ? 'bg-primary/20 text-primary border border-primary' 
                  : 'bg-primary text-primary-foreground hover:shadow-2xl hover:shadow-primary/30'
            } ${isAdding ? 'opacity-70 cursor-wait' : ''}`}
            aria-label={isOutOfStock ? 'Out of stock' : added ? 'Added to cart' : `Add ${product.name} to cart - $${product.price}`}
          >
            {isOutOfStock ? (
              'Out of Stock'
            ) : added ? (
              <>
                <Check className="w-3 h-3" /> Added
              </>
            ) : isAdding ? (
              'Adding...'
            ) : (
              `Add — $${product.price}`
            )}
          </button>
          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
              <span className="px-4 py-2 bg-muted text-muted-foreground rounded-full text-sm font-medium uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-xl lg:text-2xl italic group-hover:text-primary transition-colors duration-300 text-foreground">
            {product.name}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-foreground/50">
            {product.tagline}
          </p>
          <div className="flex items-center gap-2">
            <span className="font-sans text-base font-semibold text-foreground">
              ${product.price}
            </span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="font-sans text-sm text-foreground/40 line-through">
                ${product.compareAtPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';