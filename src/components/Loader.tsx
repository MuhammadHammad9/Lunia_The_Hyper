import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Sparkles, Droplets, Leaf } from 'lucide-react';

interface LoaderProps {
  onComplete: () => void;
}

const storySlides = [
  {
    icon: Leaf,
    title: 'Rooted in Nature',
    subtitle: 'Ethically sourced botanicals from pristine environments',
  },
  {
    icon: Sparkles,
    title: 'Refined by Science',
    subtitle: '15 years of cellular regeneration research',
  },
  {
    icon: Droplets,
    title: 'Crafted for You',
    subtitle: 'Bio-adaptive formulas that respond to your skin',
  },
];

export const Loader = ({ onComplete }: LoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const storyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressTextRef = useRef<HTMLSpanElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete();
      },
    });

    // Initial logo reveal
    tl.to(textRef.current, {
      y: 0,
      duration: 1,
      ease: 'power4.out',
    });

    // Progress bar animation with percentage counter
    tl.to(
      barRef.current,
      {
        scaleX: 1,
        duration: 4,
        ease: 'power2.inOut',
        onUpdate: function() {
          const progress = Math.round(this.progress() * 100);
          if (progressTextRef.current) {
            progressTextRef.current.textContent = `${progress}%`;
          }
        },
      },
      '-=0.5'
    );

    // Story sequence - each slide appears and fades
    storySlides.forEach((_, index) => {
      const slideTime = 0.5 + index * 1.2;
      
      tl.to({}, {
        duration: 0.01,
        onStart: () => setCurrentSlide(index),
      }, slideTime);

      if (storyRefs.current[index]) {
        tl.fromTo(
          storyRefs.current[index],
          { opacity: 0, y: 30, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' },
          slideTime
        ).to(
          storyRefs.current[index],
          { opacity: 0, y: -20, duration: 0.4, ease: 'power2.in' },
          slideTime + 0.9
        );
      }
    });

    // Final reveal - slide up
    tl.to(
      loaderRef.current,
      {
        y: '-100%',
        duration: 1.2,
        ease: 'power4.inOut',
        delay: 0.3,
      }
    );
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className="loader-screen"
    >
      {/* Ambient particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/10 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="flex flex-col items-center relative z-10">
        {/* Logo */}
        <span className="font-display italic text-5xl md:text-7xl text-primary overflow-hidden relative mb-12">
          <span
            ref={textRef}
            className="block translate-y-full"
          >
            lunia
          </span>
        </span>

        {/* Story Slides */}
        <div className="h-24 relative w-80 flex items-center justify-center">
          {storySlides.map((slide, index) => (
            <div
              key={index}
              ref={(el) => (storyRefs.current[index] = el)}
              className={`absolute inset-0 flex flex-col items-center justify-center text-center opacity-0`}
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <slide.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-xl italic text-foreground mb-1">
                {slide.title}
              </h3>
              <p className="text-xs text-foreground/50 tracking-wide">
                {slide.subtitle}
              </p>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="w-48 h-[2px] bg-foreground/10 overflow-hidden rounded-full">
            <div
              ref={barRef}
              className="w-full h-full bg-gradient-to-r from-primary via-primary to-gold origin-left scale-x-0"
            />
          </div>
          <span
            ref={progressTextRef}
            className="text-xs text-foreground/40 font-mono tracking-widest"
          >
            0%
          </span>
        </div>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-8">
          {storySlides.map((_, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-primary w-4' : 'bg-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
