import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Microscope } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export const ScienceSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!particlesRef.current) return;

    // Create particles
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div');
      const size = Math.random() * 4 + 1;
      p.style.cssText = `
        position: absolute;
        background: hsl(var(--primary));
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.3;
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
      `;
      particlesRef.current.appendChild(p);

      gsap.to(p, {
        y: -100 - Math.random() * 100,
        duration: 10 + Math.random() * 20,
        repeat: -1,
        ease: 'none',
      });
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      id="science"
      className="relative py-40 bg-charcoal text-primary-foreground overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          alt="Science background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-primary/90 to-primary/40 dark:from-black dark:via-primary/10 dark:to-transparent" />
        <div ref={particlesRef} className="absolute inset-0 z-10" />
      </div>

      <div className="relative z-20 max-w-[1920px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center">
        <div>
          <div className="inline-flex items-center gap-2 text-primary-foreground border border-white/20 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest mb-8 backdrop-blur-sm bg-transparent">
            <Microscope className="w-3 h-3" /> Clinical Innovation
          </div>
          <h2 className="font-display text-5xl md:text-7xl mb-8 leading-none text-primary-foreground">
            Powered by <br />
            <span className="italic text-gold">Nature & Science.</span>
          </h2>
          <p className="font-sans text-lg text-primary-foreground/70 max-w-md leading-relaxed mb-12 font-light">
            Our breakthrough formula isn't just skincare; it's cellular
            architecture. We've synthesized the regenerative properties of nature
            with precise molecular engineering.
          </p>

          <div className="grid grid-cols-3 gap-8 border-t border-primary-foreground/10 pt-10">
            <div className="group">
              <div className="text-4xl font-display italic text-primary-foreground mb-2 group-hover:text-gold transition-colors">
                96%
              </div>
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/40">
                Mucin Content
              </div>
            </div>
            <div className="group">
              <div className="text-4xl font-display italic text-primary-foreground mb-2 group-hover:text-gold transition-colors">
                7d
              </div>
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/40">
                Repair Time
              </div>
            </div>
            <div className="group">
              <div className="text-4xl font-display italic text-primary-foreground mb-2 group-hover:text-gold transition-colors">
                100%
              </div>
              <div className="text-[10px] uppercase tracking-widest text-primary-foreground/40">
                Clean Formula
              </div>
            </div>
          </div>
        </div>

        {/* 3D Rotating Element */}
        <div className="relative h-[600px] w-full flex items-center justify-center hover-trigger">
          <div className="w-80 h-80 rounded-full border border-primary-foreground/20 relative animate-spin-slow">
            <div className="absolute inset-0 rounded-full border border-gold/30 scale-125 animate-pulse-glow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-radial from-gold/20 to-transparent rounded-full blur-2xl" />
          </div>
          <img
            src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"
            className="absolute z-30 w-64 h-auto drop-shadow-2xl rounded-t-full border-b-4 border-gold/50 transition-transform duration-500 hover:scale-105"
            alt="Product"
          />
        </div>
      </div>
    </section>
  );
};
