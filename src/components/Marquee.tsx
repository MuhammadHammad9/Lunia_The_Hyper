const marqueeContent = `
  <span class="text-xs md:text-sm font-display italic mx-6 opacity-60">Cruelty Free</span> <span class="opacity-30">•</span>
  <span class="text-xs md:text-sm font-display italic mx-6 opacity-60">Dermatologist Tested</span> <span class="opacity-30">•</span>
  <span class="text-xs md:text-sm font-display italic mx-6 opacity-60">Sustainably Sourced</span> <span class="opacity-30">•</span>
`;

export const Marquee = ({ reverse = false }: { reverse?: boolean }) => {
  const fullContent = marqueeContent.repeat(12);

  return (
    <div className="py-3 bg-primary text-primary-foreground overflow-hidden whitespace-nowrap border-y border-primary-foreground/10 relative z-40 hover-trigger marquee-wrapper">
      <div
        className={`flex items-center w-fit ${
          reverse ? 'animate-marquee-reverse' : 'animate-marquee'
        }`}
        dangerouslySetInnerHTML={{ __html: fullContent }}
      />
    </div>
  );
};
