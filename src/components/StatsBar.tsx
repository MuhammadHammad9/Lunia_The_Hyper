import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface StatItemProps {
  value: number;
  suffix: string;
  label: string;
}

const StatItem = ({ value, suffix, label }: StatItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!itemRef.current || !counterRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(itemRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: itemRef.current,
          start: 'top 80%',
        },
      });

      gsap.to({ val: 0 }, {
        val: value,
        duration: 2,
        snap: { val: 1 },
        scrollTrigger: {
          trigger: itemRef.current,
          start: 'top 80%',
        },
        onUpdate: function() {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.floor(this.targets()[0].val));
          }
        },
      });
    }, itemRef);

    return () => ctx.revert();
  }, [value]);

  return (
    <div
      ref={itemRef}
      className="stat-item group hover-trigger text-center"
    >
      <span className="block text-5xl font-display italic text-primary mb-2 flex justify-center items-center group-hover:scale-110 transition-transform duration-300">
        <span ref={counterRef}>0</span>
        {suffix}
      </span>
      <span className="text-xs uppercase tracking-widest text-foreground/60">
        {label}
      </span>
    </div>
  );
};

export const StatsBar = () => {
  return (
    <section className="py-20 border-y border-foreground/5 bg-background relative z-20 transition-colors duration-500">
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 gap-12">
        <StatItem value={127} suffix="k+" label="Satisfied Customers" />
        <StatItem value={98} suffix="%" label="Satisfaction Rate" />
        <StatItem value={45} suffix="+" label="Countries" />
        <StatItem value={12} suffix="" label="Beauty Awards" />
      </div>
    </section>
  );
};
