import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';
import { reviews } from '@/lib/products';

gsap.registerPlugin(ScrollTrigger);

export const ReviewsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;

    // Create review cards dynamically
    cardsContainerRef.current.innerHTML = '';
    reviews.forEach((review) => {
      const card = document.createElement('div');
      card.className = 'review-card-3d hyper-glass absolute';
      card.style.cssText = `
        width: 400px;
        max-width: 85vw;
        padding: 40px;
        border-radius: 16px;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: none;
      `;
      card.innerHTML = `
        <div class="glass-spotlight"></div>
        <div class="flex items-center gap-4 mb-6 relative z-10">
          <img src="${review.img}" class="w-12 h-12 rounded-full object-cover border-2 border-primary" alt="${review.name}">
          <div>
            <h3 class="font-display text-xl font-bold text-foreground">${review.name}</h3>
            <div class="text-[10px] uppercase tracking-widest text-primary">${review.role}</div>
          </div>
        </div>
        <div class="flex text-gold mb-4 gap-1 relative z-10">
          ${Array(5).fill('<svg class="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>').join('')}
        </div>
        <p class="font-display text-lg italic text-foreground/80 relative z-10">"${review.text}"</p>
      `;
      cardsContainerRef.current?.appendChild(card);
    });

    const cards = gsap.utils.toArray('.review-card-3d');
    const Z_SPACING = 1000;
    const TOTAL_DEPTH = cards.length * Z_SPACING;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: `+=${TOTAL_DEPTH}px`,
        pin: true,
        scrub: 1.5,
        onUpdate: (self) => {
          const progress = self.progress;
          const cameraZ = progress * (TOTAL_DEPTH + 1500);

          if (gridRef.current) {
            gsap.set(gridRef.current, { z: -150 + progress * 1000 });
          }
          if (headerRef.current) {
            gsap.set(headerRef.current, {
              opacity: 1 - progress * 4,
              y: -progress * 200,
            });
          }

          cards.forEach((card: any, i: number) => {
            const z = -2000 - i * Z_SPACING + cameraZ;
            const x = i % 2 === 0 ? -25 : 25;
            const rotateY = i % 2 === 0 ? 10 : -10;
            let alpha = 0;

            if (z > -2500 && z < 1000) {
              alpha = (z + 2500) / 1000;
              if (alpha > 1) alpha = 1;
              if (z > 100) alpha = 1 - (z - 100) / 500;
            }

            if (alpha > 0) {
              gsap.set(card, {
                display: 'block',
                opacity: alpha,
                xPercent: x,
                z: z,
                rotationY: rotateY,
                filter: `blur(${Math.abs(z < -500 ? (z + 500) / 50 : 0)}px)`,
              });
            } else {
              gsap.set(card, { display: 'none', opacity: 0 });
            }
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative overflow-hidden z-30 min-h-screen"
      style={{ perspective: '1000px' }}
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary to-background" />
      </div>

      {/* 3D World */}
      <div className="relative w-full h-screen preserve-3d">
        {/* Grid Floor */}
        <div
          ref={gridRef}
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            transform: 'rotateX(60deg) translateY(100px) translateZ(-150px)',
            transformOrigin: 'center center',
            maskImage:
              'linear-gradient(to bottom, transparent 0%, black 30%, transparent 90%)',
            WebkitMaskImage:
              'linear-gradient(to bottom, transparent 0%, black 30%, transparent 90%)',
          }}
        />

        {/* Header */}
        <div
          ref={headerRef}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10"
        >
          <div className="inline-flex items-center gap-2 text-primary bg-secondary/50 border border-foreground/10 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest mb-6 backdrop-blur-sm text-foreground">
            <Star className="w-3 h-3 text-gold fill-current" /> Testimonials
          </div>
          <h2 className="font-display text-5xl md:text-7xl text-foreground leading-none">
            Global <br />
            <span className="italic text-gold">Radiance.</span>
          </h2>
        </div>

        {/* Cards Container */}
        <div ref={cardsContainerRef} className="preserve-3d" />
      </div>
    </section>
  );
};
