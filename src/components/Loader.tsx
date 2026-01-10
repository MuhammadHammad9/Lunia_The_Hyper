import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoaderProps {
  onComplete: () => void;
}

export const Loader = ({ onComplete }: LoaderProps) => {
  const loaderRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        setIsVisible(false);
        onComplete();
      },
    });

    tl.to(textRef.current, {
      y: 0,
      duration: 1,
      ease: 'power4.out',
    })
      .to(
        barRef.current,
        {
          x: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        '-=0.5'
      )
      .to(
        loaderRef.current,
        {
          y: '-100%',
          duration: 1,
          ease: 'power4.inOut',
          delay: 0.2,
        }
      );
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={loaderRef}
      className="loader-screen"
    >
      <div className="flex flex-col items-center">
        <span className="font-display italic text-4xl md:text-5xl text-primary overflow-hidden relative">
          <span
            ref={textRef}
            className="block translate-y-full"
          >
            lunia
          </span>
        </span>
        <div className="w-24 h-[1px] bg-primary/20 mt-6 overflow-hidden">
          <div
            ref={barRef}
            className="w-full h-full bg-primary -translate-x-full"
          />
        </div>
      </div>
    </div>
  );
};
