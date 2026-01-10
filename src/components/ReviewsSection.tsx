import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star } from 'lucide-react';
import { reviews } from '@/lib/products';

gsap.registerPlugin(ScrollTrigger);

// Escape HTML entities for any dynamic content used in className or style
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

interface ReviewCardProps {
  review: {
    name: string;
    role: string;
    text: string;
    img: string;
  };
  index: number;
}

const ReviewCard = ({ review, index }: ReviewCardProps) => {
  return (
    <div
      className="review-card-3d hyper-glass absolute"
      data-index={index}
      style={{
        width: '400px',
        maxWidth: '85vw',
        padding: '40px',
        borderRadius: '16px',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        display: 'none',
      }}
    >
      <div className="glass-spotlight"></div>
      <div className="flex items-center gap-4 mb-6 relative z-10">
        <img
          src={review.img}
          className="w-12 h-12 rounded-full object-cover border-2 border-primary"
          alt={`${review.name}'s profile`}
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
          }}
        />
        <div>
          <h3 className="font-display text-xl font-bold text-foreground">
            {review.name}
          </h3>
          <div className="text-[10px] uppercase tracking-widest text-primary">
            {review.role}
          </div>
        </div>
      </div>
      <div className="flex text-gold mb-4 gap-1 relative z-10">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
      </div>
      <p className="font-display text-lg italic text-foreground/80 relative z-10">
        "{review.text}"
      </p>
    </div>
  );
};

export const ReviewsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;

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

        {/* Cards Container - Now using React components instead of innerHTML */}
        <div ref={cardsContainerRef} className="preserve-3d">
          {reviews.map((review, index) => (
            <ReviewCard key={index} review={review} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
