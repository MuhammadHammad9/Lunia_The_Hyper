import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';

export const CartDrawer = () => {
  const { items, isOpen, removeItem, toggleCart, total, setCartOpen } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className={`fixed inset-0 bg-charcoal/40 z-[60] transition-opacity duration-500 backdrop-blur-sm ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Drawer */}
      <div
        className={`hyper-glass fixed inset-y-0 right-0 w-full md:w-[500px] z-[70] transition-transform duration-500 shadow-2xl flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="glass-spotlight" />

        {/* Header */}
        <div className="p-8 border-b border-foreground/5 flex justify-between items-center relative z-50 text-foreground">
          <h2 className="font-display text-3xl italic">Your Regimen</h2>
          <button
            onClick={toggleCart}
            className="hover:text-primary transition-colors duration-300 hover-trigger"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 p-8 overflow-y-auto relative z-50">
          {items.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/30">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-50 stroke-1" />
              <p className="font-display text-xl italic">Your bag is empty.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="flex gap-5 animate-[fadeIn_0.4s_ease-out]"
                >
                  <img
                    src={item.image}
                    className="w-20 h-24 object-cover rounded-sm bg-secondary"
                    alt={item.name}
                  />
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <h3 className="font-display text-lg italic text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-[10px] uppercase tracking-widest text-foreground/50">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <span className="font-sans font-medium text-foreground">
                      ${item.price * item.quantity}
                    </span>
                  </div>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-foreground/40 hover:text-destructive transition-colors self-start hover-trigger"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 bg-secondary/50 border-t border-foreground/5 relative z-50">
          <div className="flex justify-between font-display text-2xl italic mb-6 text-foreground">
            <span>Total</span>
            <span>${total().toFixed(2)}</span>
          </div>
          <button className="w-full py-5 bg-foreground text-background font-sans text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors hover-trigger">
            Checkout
          </button>
        </div>
      </div>
    </>
  );
};
