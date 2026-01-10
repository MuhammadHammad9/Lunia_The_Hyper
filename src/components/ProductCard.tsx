import { useState, forwardRef } from 'react';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { useProductModal } from '@/hooks/use-product-modal';
import { Check } from 'lucide-react';

export interface DisplayProduct {
  id: string | number;
  name: string;
  tagline: string;
  price: number;
  image: string;
  badge: string | null;
  description?: string | null;
  ingredients?: string | null;
  benefits?: string[] | null;
  images?: string[];
}

interface ProductCardProps {
  product: DisplayProduct;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  ({ product }, ref) => {
    const { addItem } = useCart();
    const { playAddToCart, playHover, playClick } = useSound();
    const { openModal } = useProductModal();
    const [added, setAdded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isAdding) return;
      
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
        <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-secondary card-shine border border-transparent dark:border-white/5">
          <img
            src={imageError ? getFallbackImage() : product.image}
            className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
            alt={product.name}
            onError={() => setImageError(true)}
          />
          {product.badge && (
            <div className="hyper-glass absolute top-4 left-4 px-3 py-1 rounded-full z-10">
              <span className="text-[10px] uppercase tracking-widest font-bold text-foreground relative z-20">
                {product.badge}
              </span>
            </div>
          )}
          <button
            onClick={handleAddToCart}
            disabled={isAdding}
            className={`product-add-btn btn-elevator rounded-full overflow-hidden shadow-xl transition-all duration-300 ${
              added ? 'bg-primary/20 border-primary' : 'btn-elevator-filled'
            } ${isAdding ? 'opacity-70 cursor-wait' : ''}`}
            aria-label={added ? 'Added to cart' : `Add ${product.name} to cart - $${product.price}`}
          >
            <div className="btn-content">
              <span className="btn-label-initial font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
                {added ? (
                  <>
                    <Check className="w-3 h-3" /> Added
                  </>
                ) : isAdding ? (
                  'Adding...'
                ) : (
                  `Add - $${product.price}`
                )}
              </span>
              <span className="btn-label-hover font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
                {added ? (
                  <>
                    <Check className="w-3 h-3" /> Added
                  </>
                ) : isAdding ? (
                  'Adding...'
                ) : (
                  `Add - $${product.price}`
                )}
              </span>
            </div>
          </button>
        </div>
        <div>
          <h3 className="font-display text-2xl italic group-hover:text-primary transition-colors duration-300 text-foreground">
            {product.name}
          </h3>
          <p className="text-[10px] uppercase tracking-widest text-foreground/50 mt-1">
            {product.tagline}
          </p>
          <span className="font-sans text-sm font-medium text-foreground">
            ${product.price}
          </span>
        </div>
      </div>
    );
  }
);

ProductCard.displayName = 'ProductCard';