import { Fragment } from 'react';

interface MarqueeItem {
  text: string;
}

const marqueeItems: MarqueeItem[] = [
  { text: 'Cruelty Free' },
  { text: 'Dermatologist Tested' },
  { text: 'Sustainably Sourced' },
];

export const Marquee = ({ reverse = false }: { reverse?: boolean }) => {
  // Create repeated content array for seamless animation
  const repeatedItems = Array(12).fill(marqueeItems).flat();

  return (
    <div className="py-3 bg-primary text-primary-foreground overflow-hidden whitespace-nowrap border-y border-primary-foreground/10 relative z-40 hover-trigger marquee-wrapper">
      <div
        className={`flex items-center w-fit ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
      >
        {repeatedItems.map((item, index) => (
          <Fragment key={index}>
            <span className="text-xs md:text-sm font-display italic mx-6 opacity-60">
              {item.text}
            </span>
            <span className="opacity-30">•</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
};