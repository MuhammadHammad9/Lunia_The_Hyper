import { Product } from '@/lib/products';
import { useCart } from '@/hooks/use-cart';

interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { addItem } = useCart();

  return (
    <div className="group cursor-pointer hover-trigger">
      <div className="relative aspect-[4/5] overflow-hidden rounded-sm mb-6 bg-secondary card-shine border border-transparent dark:border-white/5">
        <img
          src={product.image}
          className="w-full h-full object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-110"
          alt={product.name}
        />
        {product.badge && (
          <div className="hyper-glass absolute top-4 left-4 px-3 py-1 rounded-full z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold text-foreground relative z-20">
              {product.badge}
            </span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(product.id);
          }}
          className="product-add-btn btn-elevator btn-elevator-filled rounded-full overflow-hidden shadow-xl"
        >
          <div className="btn-content">
            <span className="btn-label-initial font-sans text-[10px] uppercase tracking-widest">
              Add - ${product.price}
            </span>
            <span className="btn-label-hover font-sans text-[10px] uppercase tracking-widest">
              Add - ${product.price}
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
