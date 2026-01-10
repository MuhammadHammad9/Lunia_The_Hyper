import { useState } from 'react';
import { Instagram, Facebook, Twitter, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const Footer = () => {
  const { openPage } = useVirtualPage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email });

      if (error) {
        if (error.code === '23505') {
          toast.info('You are already subscribed!');
        } else {
          throw error;
        }
      } else {
        toast.success('Welcome to the Lunia family! 🌿');
        setEmail('');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="pt-24 pb-12 px-6 lg:px-12 border-t border-foreground/5 bg-background transition-colors duration-500" role="contentinfo">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid lg:grid-cols-4 gap-12 mb-24">
          <div className="lg:col-span-2">
            <a
              href="#"
              className="font-display text-5xl font-medium tracking-tight mb-6 block hover-trigger text-foreground"
              aria-label="Lunia Skincare Home"
            >
              lunia
            </a>
            <p className="max-w-sm text-foreground/60 leading-relaxed mb-10">
              Advanced natural skincare solutions backed by science and powered by
              nature's most effective ingredients. Cruelty-free and sustainably sourced.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex items-center border-b border-foreground/20 pb-2 max-w-sm focus-within:border-primary transition-colors group">
              <Mail className="w-4 h-4 text-foreground/40 mr-3 group-focus-within:text-primary transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-transparent w-full outline-none placeholder-foreground/40 text-sm focus:text-foreground text-foreground"
                aria-label="Newsletter email"
              />
              <button 
                type="submit"
                disabled={isLoading}
                className="text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors hover-trigger flex items-center gap-1 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    Join <ArrowRight className="w-3 h-3" />
                  </>
                )}
              </button>
            </form>
          </div>

          <nav aria-label="Shop navigation">
            <h4 className="font-sans text-xs uppercase tracking-widest font-bold mb-6 text-primary">
              Shop
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70 font-medium">
              <li>
                <button
                  onClick={() => openPage('shop-all')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('bundles')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  Sets & Bundles
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('gift-cards')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  Gift Cards
                </button>
              </li>
            </ul>
          </nav>

          <nav aria-label="Support navigation">
            <h4 className="font-sans text-xs uppercase tracking-widest font-bold mb-6 text-primary">
              Support
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70 font-medium">
              <li>
                <button
                  onClick={() => openPage('contact')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('shipping')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('faq')}
                  className="nav-link hover-trigger text-left hover:text-foreground transition-colors"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center border-t border-foreground/10 pt-8 gap-4">
          <span className="text-xs text-foreground/40 uppercase tracking-widest">
            © 2026 Lunia Skincare. All rights reserved.
          </span>
          <div className="flex gap-6 text-foreground/60" role="list" aria-label="Social media links">
            <a
              href="https://instagram.com/luniaskincare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover-trigger hover:scale-110 duration-300"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://facebook.com/luniaskincare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover-trigger hover:scale-110 duration-300"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="https://twitter.com/luniaskincare"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary transition-colors hover-trigger hover:scale-110 duration-300"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Large Brand Name */}
        <div className="mt-20 text-center overflow-hidden">
          <span className="font-display text-[12vw] md:text-[15vw] leading-[0.7] select-none pointer-events-none text-foreground/[0.03] block" aria-hidden="true">
            LUNIA
          </span>
        </div>
      </div>
    </footer>
  );
};
