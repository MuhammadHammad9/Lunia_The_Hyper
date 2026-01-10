import { useSound } from '@/hooks/use-sound';
import { ArrowRight, MessageCircle } from 'lucide-react';

export const CTASection = () => {
  const { playClick, playHover } = useSound();

  const scrollToProducts = () => {
    playClick();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-32 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="Transform your skincare routine with Lunia products"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=2000&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/60 to-charcoal/80 dark:from-black/90 dark:via-black/80 dark:to-black/90" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <span className="inline-block text-xs uppercase tracking-[0.3em] text-primary-foreground/70 mb-6 font-medium">
          Transform Your Skin
        </span>
        <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-primary-foreground mb-6 leading-tight">
          Ready to Transform <br className="hidden md:block" />
          <span className="italic">Your Skin?</span>
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg leading-relaxed">
          Join thousands of satisfied customers who've discovered the power of
          natural regeneration. Free shipping on all orders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={scrollToProducts}
            onMouseEnter={playHover}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-sm uppercase tracking-wider overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center gap-2">
              Shop Now — Free Shipping
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </button>

          <button 
            onClick={playClick}
            onMouseEnter={playHover}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-primary-foreground/30 text-primary-foreground rounded-full font-medium text-sm uppercase tracking-wider transition-all duration-300 hover:bg-primary-foreground/10 hover:border-primary-foreground/50"
          >
            <MessageCircle className="w-4 h-4" />
            Talk to an Expert
          </button>
        </div>
      </div>
    </section>
  );
};
