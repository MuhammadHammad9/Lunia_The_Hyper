import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ArrowRight, PlayCircle } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';
import { ProductSearch } from '@/components/ProductSearch';
import { useProductModal } from '@/hooks/use-product-modal';

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const heroAnimRefs = useRef<(HTMLSpanElement | HTMLParagraphElement | HTMLDivElement)[]>([]);
  const { playClick, playHover } = useSound();
  const { openModal } = useProductModal();
  useEffect(() => {
    const tl = gsap.timeline({ delay: 2 });
    
    tl.to(heroAnimRefs.current, {
      y: 0,
      duration: 1.5,
      ease: 'power4.out',
      stagger: 0.1,
    });
  }, []);

  const addToRefs = (el: HTMLSpanElement | HTMLParagraphElement | HTMLDivElement | null) => {
    if (el && !heroAnimRefs.current.includes(el)) {
      heroAnimRefs.current.push(el);
    }
  };

  const scrollToProducts = () => {
    playClick();
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen pt-32 pb-20 px-6 flex items-center overflow-hidden"
      id="hero-section"
    >
      {/* Background */}
      <div className="absolute right-0 top-0 w-full md:w-[60%] h-full opacity-20 md:opacity-100 transition-opacity duration-700">
        <img
          src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=2000&auto=format&fit=crop"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Hero background"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=2000&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      </div>

      <div className="max-w-[1920px] mx-auto w-full grid lg:grid-cols-12 gap-12 relative z-10 px-6 lg:px-6">
        <div className="lg:col-span-6 flex flex-col justify-center">
          <div className="mb-8 overflow-hidden">
            <span
              ref={addToRefs}
              className="block text-primary font-sans text-xs uppercase tracking-[0.3em] font-semibold mb-4 translate-y-full"
            >
              Advanced Bio-Regeneration
            </span>
            <h1 className="font-display text-fluid-h1 text-foreground leading-[0.9]">
              <div className="overflow-hidden">
                <span ref={addToRefs} className="block translate-y-full">
                  Science Meets
                </span>
              </div>
              <div className="overflow-hidden">
                <span ref={addToRefs} className="block italic text-primary translate-y-full">
                  Regeneration.
                </span>
              </div>
            </h1>
          </div>

          <p
            ref={addToRefs}
            className="translate-y-full max-w-lg font-sans text-foreground/70 leading-relaxed mb-10 text-lg"
          >
            Revolutionary snail secretion filtrate technology meets cutting-edge
            peptides. Clinically proven to restore cellular regeneration in 7 days.
          </p>

          {/* Product Search */}
          <div ref={addToRefs} className="translate-y-full mb-8">
            <ProductSearch 
              onProductSelect={(product) => {
                openModal({
                  id: product.id,
                  name: product.name,
                  tagline: product.tagline,
                  price: product.price,
                  image: product.image_url,
                  badge: product.badge || undefined,
                });
              }}
            />
          </div>

          <div ref={addToRefs} className="translate-y-full flex flex-wrap gap-4">
            <button
              onClick={scrollToProducts}
              onMouseEnter={playHover}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-xs uppercase tracking-wider overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2">
                Shop Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </button>

            <button 
              onMouseEnter={playHover}
              onClick={playClick}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 border border-foreground/20 text-foreground rounded-full font-medium text-xs uppercase tracking-wider transition-all duration-300 hover:bg-foreground/5 hover:border-foreground/40"
            >
              <PlayCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
              Watch Film
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 relative hidden lg:block">
          <div className="relative w-[80%] ml-auto group">
            <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-500 rounded-xl z-10 pointer-events-none" />
            <img
              src="https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=800&auto=format&fit=crop"
              className="w-full rounded-xl shadow-2xl object-cover aspect-[4/5] transform transition-transform duration-700 group-hover:scale-[1.02]"
              alt="Featured product"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=800&auto=format&fit=crop';
              }}
            />

            {/* Floating Glass Card */}
            <div className="hyper-glass absolute bottom-16 -left-12 p-6 rounded-lg max-w-xs z-20 hover:scale-105 transition-transform duration-300">
              <div className="glass-spotlight" />
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <div className="flex -space-x-2">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop"
                    className="w-8 h-8 rounded-full border border-background object-cover"
                    alt="Customer"
                  />
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop"
                    className="w-8 h-8 rounded-full border border-background object-cover"
                    alt="Customer"
                  />
                  <div className="w-8 h-8 rounded-full border border-background bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                    +2k
                  </div>
                </div>
                <div className="text-xs font-medium text-primary uppercase tracking-wide">
                  Dermatologist Approved
                </div>
              </div>
              <p className="font-display italic text-lg leading-tight text-foreground relative z-10">
                "The most effective natural serum I've ever used."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
