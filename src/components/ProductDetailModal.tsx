import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { DisplayProduct } from '@/components/ProductCard';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ProductReviews } from '@/components/ProductReviews';

interface ProductDetailModalProps {
  product: DisplayProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const getProductDetails = (product: DisplayProduct) => {
  if (product.images && product.images.length > 0) {
    return {
      description: product.description || `Experience the transformative power of ${product.name}.`,
      ingredients: product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : ["Natural Botanicals", "Hyaluronic Acid"],
      images: product.images,
      benefits: product.benefits || [],
    };
  }

  return {
    description: `Experience the transformative power of ${product.name}.`,
    ingredients: ["Natural Botanicals", "Hyaluronic Acid", "Vitamin Complex"],
    images: [product.image],
    benefits: [],
  };
};

export const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();
  const { playClick, playModalOpen, playModalClose, playAddToCart } = useSound();

  const details = product ? getProductDetails(product) : null;
  const isValidUUID = product?.id && typeof product.id === 'string' && 
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(product.id);

  useEffect(() => {
    setCurrentImageIndex(0);
    setIsAdded(false);
  }, [product?.id]);

  useEffect(() => {
    if (isOpen) playModalOpen();
  }, [isOpen, playModalOpen]);

  const handleClose = useCallback(() => {
    playModalClose();
    onClose();
  }, [onClose, playModalClose]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem({
      id: product.id,
      name: product.name,
      tagline: product.tagline,
      price: product.price,
      image: product.image,
      badge: product.badge,
    });
    playAddToCart();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!product || !details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0 bg-background border-border/50 rounded-2xl shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.tagline}</DialogDescription>
        </VisuallyHidden>
        
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
          {/* Image Gallery */}
          <div className="relative bg-secondary/30 aspect-square md:aspect-auto">
            <div className="relative h-full overflow-hidden">
              <img
                src={details.images[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-full">
                  <span className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {product.badge}
                  </span>
                </div>
              )}
              {details.images.length > 1 && (
                <>
                  <button
                    onClick={() => { setCurrentImageIndex((p) => p === 0 ? details.images.length - 1 : p - 1); playClick(); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => { setCurrentImageIndex((p) => p === details.images.length - 1 ? 0 : p + 1); playClick(); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="p-8 md:p-12 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-2">{product.tagline}</p>
                <h2 className="font-display text-4xl italic text-foreground">{product.name}</h2>
                <p className="font-display text-3xl text-primary mt-4">${product.price}</p>
              </div>

              <p className="text-foreground/80 leading-relaxed">{details.description}</p>

              {details.benefits.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {details.benefits.map((b, i) => (
                    <span key={i} className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary">{b}</span>
                  ))}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                className={`w-full py-4 rounded-full font-medium transition-all ${isAdded ? 'bg-primary/20 text-primary' : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
              >
                {isAdded ? <><Check className="w-4 h-4 inline mr-2" />Added to Cart</> : `Add to Cart — $${product.price}`}
              </button>

              {isValidUUID && (
                <div className="pt-6 border-t border-border/30">
                  <ProductReviews productId={product.id as string} productName={product.name} />
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
