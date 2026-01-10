import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { reviews } from '@/lib/products';

gsap.registerPlugin(ScrollTrigger);

interface ReviewCardProps {
  review: {
    name: string;
    role: string;
    text: string;
    img: string;
  };
  isActive: boolean;
  position: 'left' | 'center' | 'right' | 'hidden';
}

const ReviewCard = ({ review, isActive, position }: ReviewCardProps) => {
  const positionStyles = {
    left: 'translate-x-[-80%] scale-75 opacity-40 blur-[2px] z-10',
    center: 'translate-x-0 scale-100 opacity-100 blur-0 z-30',
    right: 'translate-x-[80%] scale-75 opacity-40 blur-[2px] z-10',
    hidden: 'translate-x-0 scale-50 opacity-0 z-0',
  };

  return (
    <div
      className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md transition-all duration-700 ease-out ${positionStyles[position]}`}
    >
      <div className="relative bg-background/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
        {/* Quote Icon */}
        <div className="absolute -top-4 -left-4 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Quote className="w-5 h-5 text-primary-foreground" />
        </div>

        {/* Stars */}
        <div className="flex gap-1 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-gold fill-current" />
          ))}
        </div>

        {/* Review Text */}
        <p className="font-display text-lg md:text-xl italic text-foreground/90 leading-relaxed mb-8">
          "{review.text}"
        </p>

        {/* Author */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={review.img}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/30"
              alt={`${review.name}'s profile`}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop';
              }}
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              {review.name}
            </h3>
            <p className="text-sm text-primary font-medium uppercase tracking-wider">
              {review.role}
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-tr-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-gold/5 to-transparent rounded-bl-2xl pointer-events-none" />
      </div>
    </div>
  );
};

export const ReviewsSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Scroll-triggered entrance animation
  useEffect(() => {
    if (!sectionRef.current || !headerRef.current) return;

    const ctx = gsap.context(() => {
      // Header entrance
      gsap.fromTo(
        headerRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Floating particles effect
      const particles = gsap.utils.toArray<HTMLElement>('.review-particle');
      particles.forEach((particle, i) => {
        gsap.to(particle, {
          y: 'random(-30, 30)',
          x: 'random(-20, 20)',
          duration: 'random(3, 5)',
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.2,
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const getPosition = (index: number): 'left' | 'center' | 'right' | 'hidden' => {
    const diff = index - activeIndex;
    const totalReviews = reviews.length;
    
    // Handle wrap-around
    const normalizedDiff = ((diff % totalReviews) + totalReviews) % totalReviews;
    
    if (normalizedDiff === 0) return 'center';
    if (normalizedDiff === 1 || (normalizedDiff === totalReviews - 1 && totalReviews > 2)) {
      return diff === 1 || diff === -(totalReviews - 1) ? 'right' : 'left';
    }
    if (normalizedDiff === totalReviews - 1) return 'left';
    return 'hidden';
  };

  const handlePrev = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative overflow-hidden z-30 py-24 md:py-32 min-h-screen flex items-center"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="review-particle absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-primary bg-secondary/50 border border-foreground/10 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest mb-6 backdrop-blur-sm">
            <Star className="w-3 h-3 text-gold fill-current" /> Testimonials
          </div>
          <h2 className="font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-none">
            Real Results, <br />
            <span className="italic text-gold">Real Stories.</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Join thousands of satisfied customers who have transformed their skincare routine
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative h-[500px] md:h-[450px] max-w-4xl mx-auto">
          {/* Cards */}
          {reviews.map((review, index) => (
            <ReviewCard
              key={index}
              review={review}
              isActive={index === activeIndex}
              position={getPosition(index)}
            />
          ))}

          {/* Navigation Arrows */}
          <button
            onClick={handlePrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-12 w-12 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 z-40 shadow-lg group"
            aria-label="Previous review"
          >
            <ChevronLeft className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-12 w-12 h-12 bg-background/80 backdrop-blur-sm border border-border rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 z-40 shadow-lg group"
            aria-label="Next review"
          >
            <ChevronRight className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {reviews.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsAutoPlaying(false);
                setActiveIndex(index);
              }}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? 'w-8 bg-primary' 
                  : 'w-2 bg-foreground/20 hover:bg-foreground/40'
              }`}
              aria-label={`Go to review ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
          {[
            { value: '50K+', label: 'Happy Customers' },
            { value: '4.9', label: 'Average Rating' },
            { value: '98%', label: 'Would Recommend' },
            { value: '12K+', label: '5-Star Reviews' },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 bg-secondary/30 rounded-xl border border-border/50 backdrop-blur-sm">
              <div className="font-display text-2xl md:text-3xl text-primary font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};