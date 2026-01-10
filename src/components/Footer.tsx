import { Instagram, Facebook, Twitter } from 'lucide-react';
import { useVirtualPage } from '@/hooks/use-virtual-page';

export const Footer = () => {
  const { openPage } = useVirtualPage();

  return (
    <footer className="pt-24 pb-12 px-6 lg:px-12 border-t border-foreground/5 bg-background transition-colors duration-500">
      <div className="max-w-[1920px] mx-auto">
        <div className="grid lg:grid-cols-4 gap-12 mb-24">
          <div className="lg:col-span-2">
            <a
              href="#"
              className="font-display text-5xl font-medium tracking-tight mb-6 block hover-trigger text-foreground"
            >
              lunia
            </a>
            <p className="max-w-sm text-foreground/60 leading-relaxed mb-10">
              Advanced natural skincare solutions backed by science and powered by
              nature's most effective ingredients.
            </p>
            <form className="flex border-b border-foreground/20 pb-2 max-w-sm focus-within:border-primary transition-colors">
              <input
                type="email"
                placeholder="Newsletter"
                className="bg-transparent w-full outline-none placeholder-foreground/40 text-sm focus:text-foreground text-foreground"
              />
              <button className="text-xs uppercase tracking-widest text-foreground hover:text-primary transition-colors hover-trigger">
                Join
              </button>
            </form>
          </div>

          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest font-bold mb-6 text-primary">
              Shop
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70 font-medium">
              <li>
                <button
                  onClick={() => openPage('shop-all')}
                  className="nav-link hover-trigger text-left"
                >
                  All Products
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('bundles')}
                  className="nav-link hover-trigger text-left"
                >
                  Sets & Bundles
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('gift-cards')}
                  className="nav-link hover-trigger text-left"
                >
                  Gift Cards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-sans text-xs uppercase tracking-widest font-bold mb-6 text-primary">
              Support
            </h4>
            <ul className="space-y-4 text-sm text-foreground/70 font-medium">
              <li>
                <button
                  onClick={() => openPage('contact')}
                  className="nav-link hover-trigger text-left"
                >
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('shipping')}
                  className="nav-link hover-trigger text-left"
                >
                  Shipping & Returns
                </button>
              </li>
              <li>
                <button
                  onClick={() => openPage('faq')}
                  className="nav-link hover-trigger text-left"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-end border-t border-foreground/10 pt-8">
          <span className="text-xs text-foreground/40 uppercase tracking-widest">
            © 2026 Lunia Skincare. All rights reserved.
          </span>
          <div className="flex gap-6 mt-4 md:mt-0 text-foreground/60">
            <a
              href="#"
              className="hover:text-primary transition-colors hover-trigger"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors hover-trigger"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="hover:text-primary transition-colors hover-trigger"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Large Brand Name */}
        <div className="mt-20 text-center">
          <span className="font-display text-[15vw] leading-[0.7] select-none pointer-events-none text-foreground/5 block">
            LUNIA
          </span>
        </div>
      </div>
    </footer>
  );
};
