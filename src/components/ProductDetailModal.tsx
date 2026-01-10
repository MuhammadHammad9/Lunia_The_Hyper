import { useEffect, useState, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Check, Sparkles } from 'lucide-react';
import { DisplayProduct } from '@/components/ProductCard';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface ProductDetailModalProps {
  product: DisplayProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

// Get product details - for DB products, use their data; for legacy products, use fallback
const getProductDetails = (product: DisplayProduct) => {
  // If product has images array from database, use it
  if (product.images && product.images.length > 0) {
    return {
      description: product.description || `Experience the transformative power of ${product.name}. Our scientifically formulated products combine the best of nature and science for visible results.`,
      ingredients: product.ingredients ? product.ingredients.split(',').map(i => i.trim()) : ["Natural Botanicals", "Hyaluronic Acid", "Vitamin Complex", "Peptides", "Plant Extracts"],
      images: product.images,
      benefits: product.benefits || [],
    };
  }

  // Fallback for legacy static products
  const details: Record<number, { description: string; ingredients: string[]; images: string[]; benefits: string[] }> = {
    1: {
      description: "Our signature Regenerating Serum harnesses the power of bio-fermented snail mucin, clinically proven to boost collagen production by 43%. This ultra-concentrated formula penetrates deep into the dermis, delivering transformative hydration and visible skin renewal within 14 days.",
      ingredients: ["Bio-Fermented Snail Mucin (92%)", "Hyaluronic Acid Complex", "Niacinamide 5%", "Centella Asiatica Extract", "Peptide Complex", "Vitamin E", "Aloe Vera"],
      images: [
        "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=800&auto=format&fit=crop"
      ],
      benefits: ['Deep hydration', 'Reduces fine lines', 'Promotes cell regeneration'],
    },
    2: {
      description: "Experience 24-hour moisture lock technology with our Hydrating Cream. Formulated with triple-weight hyaluronic acid and ceramide complex, this luxurious cream creates an invisible moisture barrier that keeps skin plump and dewy all day long.",
      ingredients: ["Triple-Weight Hyaluronic Acid", "Ceramide NP", "Squalane", "Shea Butter", "Glycerin", "Vitamin B5", "Rose Hip Oil"],
      images: [
        "https://images.unsplash.com/photo-1570194065650-d99fb4d38c8a?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop"
      ],
      benefits: ['24-hour hydration', 'Plumps skin', 'Strengthens skin barrier'],
    },
    3: {
      description: "Shield your skin with our mineral-based UV Defense SPF 50. This antioxidant-rich formula provides broad-spectrum protection while combating environmental stressors. Lightweight, non-greasy, and perfect for daily wear.",
      ingredients: ["Zinc Oxide 18%", "Titanium Dioxide 4%", "Vitamin C (Ascorbic Acid)", "Green Tea Extract", "Vitamin E", "Jojoba Oil", "Aloe Vera"],
      images: [
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=800&auto=format&fit=crop"
      ],
      benefits: ['Broad spectrum SPF 50', 'Antioxidant protection', 'No white cast'],
    },
  };

  const numId = typeof product.id === 'number' ? product.id : parseInt(String(product.id).slice(-1)) || 1;
  return details[numId] || {
    description: `Experience the transformative power of ${product.name}. Our scientifically formulated products combine the best of nature and science for visible results.`,
    ingredients: ["Natural Botanicals", "Hyaluronic Acid", "Vitamin Complex", "Peptides", "Plant Extracts"],
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

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setIsAdded(false);
  }, [product?.id]);

  // Play modal sounds
  useEffect(() => {
    if (isOpen) {
      playModalOpen();
    }
  }, [isOpen, playModalOpen]);

  const handleClose = useCallback(() => {
    playModalClose();
    onClose();
  }, [onClose, playModalClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || !details) return;
      
      if (e.key === 'ArrowLeft') {
        setCurrentImageIndex((prev) => 
          prev === 0 ? details.images.length - 1 : prev - 1
        );
        playClick();
      } else if (e.key === 'ArrowRight') {
        setCurrentImageIndex((prev) => 
          prev === details.images.length - 1 ? 0 : prev + 1
        );
        playClick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, details, playClick]);

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

  const nextImage = () => {
    if (!details) return;
    setCurrentImageIndex((prev) => 
      prev === details.images.length - 1 ? 0 : prev + 1
    );
    playClick();
  };

  const prevImage = () => {
    if (!details) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? details.images.length - 1 : prev - 1
    );
    playClick();
  };

  if (!product || !details) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden p-0 bg-background border-border/50 rounded-2xl shadow-2xl">
        <VisuallyHidden>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>{product.tagline}</DialogDescription>
        </VisuallyHidden>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover-trigger"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-2 h-full max-h-[90vh]">
          {/* Image Gallery */}
          <div className="relative bg-secondary/30 aspect-square md:aspect-auto">
            {/* Main Image */}
            <div className="relative h-full overflow-hidden">
              <img
                src={details.images[currentImageIndex]}
                alt={`${product.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-all duration-500"
              />
              
              {/* Badge */}
              {product.badge && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-primary text-primary-foreground rounded-full">
                  <span className="text-xs uppercase tracking-widest font-bold flex items-center gap-2">
                    <Sparkles className="w-3 h-3" /> {product.badge}
                  </span>
                </div>
              )}

              {/* Navigation Arrows */}
              {details.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover-trigger"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 hover-trigger"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {details.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {details.images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      playClick();
                    }}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 hover-trigger ${
                      currentImageIndex === index 
                        ? 'border-primary shadow-lg scale-105' 
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                    aria-label={`View image ${index + 1}`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="p-8 md:p-12 overflow-y-auto max-h-[50vh] md:max-h-[90vh]">
            <div className="space-y-8">
              {/* Header */}
              <div>
                <p className="text-xs uppercase tracking-widest text-primary mb-2">
                  {product.tagline}
                </p>
                <h2 className="font-display text-4xl md:text-5xl italic text-foreground">
                  {product.name}
                </h2>
                <p className="font-display text-3xl text-primary mt-4">
                  ${product.price}
                </p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-sans text-xs uppercase tracking-widest text-foreground/60 mb-3">
                  Description
                </h3>
                <p className="text-foreground/80 leading-relaxed">
                  {details.description}
                </p>
              </div>

              {/* Benefits */}
              {details.benefits && details.benefits.length > 0 && (
                <div>
                  <h3 className="font-sans text-xs uppercase tracking-widest text-foreground/60 mb-3">
                    Benefits
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {details.benefits.map((benefit, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-sm text-primary"
                      >
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h3 className="font-sans text-xs uppercase tracking-widest text-foreground/60 mb-3">
                  Key Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {details.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-secondary/50 border border-border/30 rounded-full text-sm text-foreground/80"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                className={`w-full btn-elevator rounded-full overflow-hidden shadow-xl transition-all duration-300 ${
                  isAdded ? 'bg-primary/20 border-primary' : 'btn-elevator-filled'
                } hover-trigger`}
              >
                <div className="btn-content">
                  <span className="btn-label-initial font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Cart
                      </>
                    ) : (
                      `Add to Cart — $${product.price}`
                    )}
                  </span>
                  <span className="btn-label-hover font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added to Cart
                      </>
                    ) : (
                      `Add to Cart — $${product.price}`
                    )}
                  </span>
                </div>
              </button>

              {/* Benefits */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
                {[
                  { label: 'Free Shipping', sub: 'Orders $150+' },
                  { label: '60 Day Returns', sub: 'No Questions' },
                  { label: 'Cruelty Free', sub: 'Always' }
                ].map((benefit, i) => (
                  <div key={i} className="text-center">
                    <p className="text-xs font-medium text-foreground">{benefit.label}</p>
                    <p className="text-[10px] text-foreground/50">{benefit.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
