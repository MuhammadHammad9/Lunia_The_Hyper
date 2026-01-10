import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const useGsapAnimations = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Initialize GSAP with ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);
    setIsLoaded(true);
    
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return { isLoaded };
};

export const useParallax = (speed: number = 0.2) => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      gsap.to(ref.current, {
        yPercent: 20 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [speed]);

  return ref;
};

export const useRevealOnScroll = () => {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 85%',
        onEnter: () => ref.current?.classList.add('is-in-view'),
      });
    }, ref);

    return () => ctx.revert();
  }, []);

  return ref;
};

export const useCountUp = (target: number, duration: number = 2) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!ref.current || hasAnimated.current) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: ref.current,
        start: 'top 80%',
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;
          
          gsap.to({ value: 0 }, {
            value: target,
            duration,
            onUpdate: function() {
              setCount(Math.floor(this.targets()[0].value));
            },
          });
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [target, duration]);

  return { count, ref };
};
