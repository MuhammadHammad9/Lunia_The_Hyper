import { useEffect, useRef, useState } from 'react';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { CustomCursor } from '@/components/CustomCursor';
import { Loader } from '@/components/Loader';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { StatsBar } from '@/components/StatsBar';
import { FeaturesSection } from '@/components/FeaturesSection';
import { ScienceSection } from '@/components/ScienceSection';
import { ProductsSection } from '@/components/ProductsSection';
import { ReviewsSection } from '@/components/ReviewsSection';
import { Marquee } from '@/components/Marquee';
import { CTASection } from '@/components/CTASection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { VirtualPages } from '@/components/VirtualPages';
import { useTheme } from '@/hooks/use-theme';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const { initTheme } = useTheme();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (!isLoaded) return;

    // Initialize Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    // Initialize reveal animations
    gsap.utils.toArray('.reveal-text').forEach((el: any) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('is-in-view'),
      });
    });

    // Initialize stat items
    gsap.utils.toArray('.stat-item').forEach((item: any) => {
      ScrollTrigger.create({
        trigger: item,
        start: 'top 80%',
        onEnter: () => item.classList.add('in-view'),
      });
    });

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [isLoaded]);

  const handleLoadComplete = () => {
    setIsLoaded(true);
    ScrollTrigger.refresh();
  };

  return (
    <div className="cursor-none">
      <CustomCursor />
      <Loader onComplete={handleLoadComplete} />
      
      {isLoaded && (
        <>
          <Navbar lenis={lenisRef.current} />
          
          <main>
            <Hero />
            <StatsBar />
            <FeaturesSection />
            <ScienceSection />
            <ProductsSection />
            <ReviewsSection />
            <Marquee />
            <CTASection />
            <Marquee reverse />
          </main>
          
          <Footer />
          <CartDrawer />
          <VirtualPages lenis={lenisRef.current} />
        </>
      )}
    </div>
  );
};

export default Index;
