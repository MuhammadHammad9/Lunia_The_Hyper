import { Zap, ShieldCheck, Leaf, Award, Sparkles, Heart } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Fast-Acting Formula',
    description:
      'See visible results in just 7 days. Our advanced peptide complex accelerates skin renewal and collagen production.',
    stat: '7 Days',
    statLabel: 'to visible results',
  },
  {
    icon: ShieldCheck,
    title: 'Clinically Proven',
    description:
      'Tested on 1000+ participants with 96% showing significant improvement in skin texture and hydration levels.',
    stat: '96%',
    statLabel: 'satisfaction rate',
  },
  {
    icon: Leaf,
    title: '100% Natural',
    description:
      'Sustainably sourced ingredients with zero harmful chemicals. Perfect for sensitive skin types.',
    stat: '0%',
    statLabel: 'harmful chemicals',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-32 px-6 lg:px-12 max-w-[1920px] mx-auto" aria-labelledby="features-heading">
      <div className="text-center mb-20">
        <span className="font-sans text-xs uppercase tracking-widest text-primary mb-4 block font-medium">
          15 Years of Research
        </span>
        <div className="reveal-text">
          <h2 id="features-heading" className="font-display text-4xl md:text-5xl italic text-foreground">
            Why Choose Lunia?
          </h2>
        </div>
        <p className="mt-6 text-foreground/60 max-w-xl mx-auto leading-relaxed">
          Backed by dermatological research and powered by nature's most effective
          ingredients.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <article
            key={feature.title}
            className={`group relative p-8 lg:p-10 rounded-2xl bg-secondary/50 border border-transparent transition-all duration-500 hover:bg-card hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 hover:border-primary/10 cursor-pointer ${
              index === 1 ? 'md:-mt-8' : ''
            }`}
          >
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:bg-primary group-hover:text-primary-foreground group-hover:rotate-6 group-hover:scale-110">
                <feature.icon className="w-6 h-6" />
              </div>
              
              <h3 className="font-display text-2xl mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>
              
              <p className="font-sans text-sm text-foreground/70 leading-relaxed mb-6">
                {feature.description}
              </p>
              
              {/* Stats */}
              <div className="pt-6 border-t border-foreground/10">
                <span className="font-display text-3xl text-primary">{feature.stat}</span>
                <span className="block text-xs uppercase tracking-wider text-foreground/50 mt-1">{feature.statLabel}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
