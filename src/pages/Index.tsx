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
import { ProductDetailModal } from '@/components/ProductDetailModal';
import { DarkModeBackground } from '@/components/DarkModeBackground';
import { useTheme } from '@/hooks/use-theme';
import { useProductModal } from '@/hooks/use-product-modal';
import { SoundProvider } from '@/hooks/use-sound';

gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const lenisRef = useRef<Lenis | null>(null);
  const { initTheme } = useTheme();
  const { isOpen, product, closeModal } = useProductModal();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    if (!isLoaded) return;

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

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.utils.toArray('.reveal-text').forEach((el: any) => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => el.classList.add('is-in-view'),
      });
    });

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
    document.body.style.overflow = '';
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  };

  return (
    <SoundProvider>
      <div className="cursor-none">
        <DarkModeBackground />
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
            <ProductDetailModal product={product} isOpen={isOpen} onClose={closeModal} />
          </>
        )}
      </div>
    </SoundProvider>
  );
};

export default Index;
