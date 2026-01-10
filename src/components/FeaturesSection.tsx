import { Zap, ShieldCheck, Leaf } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Fast-Acting Formula',
    description:
      'See visible results in just 7 days. Our advanced peptide complex accelerates skin renewal and collagen production.',
  },
  {
    icon: ShieldCheck,
    title: 'Clinically Proven',
    description:
      'Tested on 1000+ participants with 96% showing significant improvement in skin texture and hydration levels.',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    description:
      'Sustainably sourced ingredients with zero harmful chemicals. Perfect for sensitive skin types.',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-32 px-6 lg:px-12 max-w-[1920px] mx-auto">
      <div className="text-center mb-20">
        <span className="font-sans text-xs uppercase tracking-widest text-foreground/50 mb-4 block">
          15 Years of Research
        </span>
        <div className="reveal-text">
          <div className="font-display text-5xl italic text-foreground">
            Why Choose Lunia?
          </div>
        </div>
        <p className="mt-6 text-foreground/60 max-w-xl mx-auto">
          Backed by dermatological research and powered by nature's most effective
          ingredients.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={feature.title}
            className={`feature-card group cursor-pointer hover-trigger ${
              index === 1 ? 'md:-mt-8' : ''
            }`}
          >
            <div className="feature-icon">
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="font-display text-2xl mb-4 text-foreground group-hover:translate-x-2 transition-transform duration-300">
              {feature.title}
            </h3>
            <p className="font-sans text-sm text-foreground/70 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
