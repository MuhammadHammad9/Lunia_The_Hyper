export const CTASection = () => {
  const scrollToProducts = () => {
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative py-32 flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1545646399-6f17d3d71249?q=80&w=2000&auto=format&fit=crop"
          className="w-full h-full object-cover"
          alt="CTA background"
        />
        <div className="absolute inset-0 bg-charcoal/60 dark:bg-black/80" />
      </div>

      <div className="relative z-10 text-center px-6">
        <h2 className="font-display text-4xl md:text-6xl text-primary-foreground mb-6">
          Ready to Transform Your Skin?
        </h2>
        <p className="text-primary-foreground/80 max-w-xl mx-auto mb-10 text-lg">
          Join thousands of satisfied customers who've discovered the power of
          natural regeneration.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <button
            onClick={scrollToProducts}
            className="btn-elevator btn-elevator-filled hover-trigger group rounded-full overflow-hidden shadow-lg"
          >
            <div className="btn-content">
              <span className="btn-label-initial font-sans text-xs uppercase tracking-widest">
                Shop Now - Free Shipping
              </span>
              <span className="btn-label-hover font-sans text-xs uppercase tracking-widest">
                Shop Now - Free Shipping
              </span>
            </div>
          </button>

          <button className="btn-elevator hover-trigger group rounded-full border border-primary-foreground text-primary-foreground bg-transparent overflow-hidden">
            <div className="btn-content">
              <span className="btn-label-initial font-sans text-xs uppercase tracking-widest text-primary-foreground">
                Talk to an Expert
              </span>
              <span className="btn-label-hover font-sans text-xs uppercase tracking-widest text-primary-foreground">
                Talk to an Expert
              </span>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
};
