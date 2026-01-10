import { useEffect, useRef, useState } from 'react';
import { useTheme } from '@/hooks/use-theme';

export const DarkModeBackground = () => {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (!isDark) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden"
      aria-hidden="true"
    >
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(0,0%,2%)] via-[hsl(159,47%,5%)] to-[hsl(0,0%,2%)]" />

      {/* Animated gradient orbs */}
      {!reducedMotion && (
        <>
          <div 
            className="absolute w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[120px] animate-dark-orb-1"
            style={{ 
              background: 'radial-gradient(circle, hsl(159, 47%, 21%) 0%, transparent 70%)',
              top: '-20%',
              left: '-10%'
            }} 
          />
          <div 
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.05] blur-[100px] animate-dark-orb-2"
            style={{ 
              background: 'radial-gradient(circle, hsl(40, 51%, 56%) 0%, transparent 70%)',
              bottom: '-10%',
              right: '-5%'
            }} 
          />
          <div 
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[80px] animate-dark-orb-3"
            style={{ 
              background: 'radial-gradient(circle, hsl(159, 47%, 15%) 0%, transparent 70%)',
              top: '40%',
              right: '20%'
            }} 
          />
        </>
      )}

      {/* Noise/grain overlay for texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(43, 10%, 97%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(43, 10%, 97%) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(0, 0%, 2%) 100%)',
          opacity: 0.4
        }}
      />
    </div>
  );
};