import { products } from '@/lib/products';
import { ProductCard } from './ProductCard';

export const ProductsSection = () => {
  return (
    <section
      id="products"
      className="py-32 px-6 lg:px-12 max-w-[1920px] mx-auto bg-transparent"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
        <div>
          <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block">
            The Collection
          </span>
          <h2 className="font-display text-fluid-h2 text-foreground reveal-text">
            <div>Curated Regimen</div>
          </h2>
        </div>
        <div className="flex gap-4">
          <div className="h-[1px] w-24 bg-foreground/20 self-center" />
          <span className="font-sans text-xs uppercase tracking-widest text-foreground/50">
            {products.length} Products Available
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
