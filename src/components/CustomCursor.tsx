import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CustomCursorProps {
  className?: string;
}

export const CustomCursor = ({ className }: CustomCursorProps) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const positionRef = useRef({ x: 0, y: 0 });

  // Detect touch device
  useEffect(() => {
    const checkTouchDevice = () => {
      const hasTouch = 'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.matchMedia('(pointer: coarse)').matches;
      setIsTouchDevice(hasTouch);
    };

    checkTouchDevice();
    window.addEventListener('resize', checkTouchDevice);
    return () => window.removeEventListener('resize', checkTouchDevice);
  }, []);

  useEffect(() => {
    if (isTouchDevice) return;

    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      positionRef.current = { x: clientX, y: clientY };

      // Immediate position for dot (no lag)
      if (dotRef.current) {
        dotRef.current.style.left = `${clientX}px`;
        dotRef.current.style.top = `${clientY}px`;
      }
      
      // Smooth follow for outline with GSAP
      if (outlineRef.current) {
        gsap.to(outlineRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.12,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      // Update glass spotlight effect
      document.querySelectorAll('.hyper-glass').forEach((glass) => {
        const rect = glass.getBoundingClientRect();
        (glass as HTMLElement).style.setProperty('--mouse-x', `${clientX - rect.left}px`);
        (glass as HTMLElement).style.setProperty('--mouse-y', `${clientY - rect.top}px`);
      });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    document.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Add hover listeners to trigger elements with MutationObserver for dynamic content
    const addHoverListeners = () => {
      const triggers = document.querySelectorAll('.hover-trigger, a, button, [role="button"]');
      triggers.forEach((el) => {
        el.addEventListener('mouseenter', handleMouseEnter);
        el.addEventListener('mouseleave', handleMouseLeave);
      });
      return triggers;
    };

    let triggers = addHoverListeners();

    // Watch for DOM changes to add listeners to new elements
    const observer = new MutationObserver(() => {
      triggers.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      triggers = addHoverListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      triggers.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
      observer.disconnect();
    };
  }, [isTouchDevice]);

  useEffect(() => {
    if (isHovering) {
      document.body.classList.add('hovering');
    } else {
      document.body.classList.remove('hovering');
    }
  }, [isHovering]);

  // Don't render on touch devices
  if (isTouchDevice) return null;

  return (
    <>
      <div
        ref={dotRef}
        id="cursor-dot"
        className="hidden md:block"
        style={{ willChange: 'left, top' }}
      />
      <div
        ref={outlineRef}
        id="cursor-outline"
        className="hidden md:block"
        style={{ willChange: 'transform' }}
      />
    </>
  );
};
