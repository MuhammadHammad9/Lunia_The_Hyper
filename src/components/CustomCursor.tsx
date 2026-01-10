import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CustomCursorProps {
  className?: string;
}

export const CustomCursor = ({ className }: CustomCursorProps) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      if (dotRef.current) {
        dotRef.current.style.left = `${clientX}px`;
        dotRef.current.style.top = `${clientY}px`;
      }
      
      if (outlineRef.current) {
        gsap.to(outlineRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.15,
          ease: 'power2.out',
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

    document.addEventListener('mousemove', handleMouseMove);

    // Add hover listeners to trigger elements
    const triggers = document.querySelectorAll('.hover-trigger');
    triggers.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      triggers.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);

  useEffect(() => {
    if (isHovering) {
      document.body.classList.add('hovering');
    } else {
      document.body.classList.remove('hovering');
    }
  }, [isHovering]);

  return (
    <>
      <div
        ref={dotRef}
        id="cursor-dot"
        className="hidden md:block"
      />
      <div
        ref={outlineRef}
        id="cursor-outline"
        className="hidden md:block"
      />
    </>
  );
};
