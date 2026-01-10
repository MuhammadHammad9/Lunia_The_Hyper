import { useState } from 'react';
import { Product } from '@/lib/products';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();
  const { playAddToCart, playHover } = useSound();
  const [added, setAdded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product.id);
    playAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Fallback images for different product types
  const getFallbackImage = () => {
    const fallbacks = [
      'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1570194065650-d99fb4d38c8a?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop',
    ];
    return fallbacks[product.id % fallbacks.length];
  };

  return (
    <div 
      className="group cursor-pointer hover-trigger"
      onMouseEnter={playHover}
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
          className={`product-add-btn btn-elevator rounded-full overflow-hidden shadow-xl transition-all duration-300 ${
            added ? 'bg-primary/20 border-primary' : 'btn-elevator-filled'
          }`}
        >
          <div className="btn-content">
            <span className="btn-label-initial font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
              {added ? (
                <>
                  <Check className="w-3 h-3" /> Added
                </>
              ) : (
                `Add - $${product.price}`
              )}
            </span>
            <span className="btn-label-hover font-sans text-[10px] uppercase tracking-widest flex items-center gap-2">
              {added ? (
                <>
                  <Check className="w-3 h-3" /> Added
                </>
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
};
