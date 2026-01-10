import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Search, ShoppingBag } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import Lenis from '@studio-freight/lenis';

interface NavbarProps {
  lenis: Lenis | null;
}

export const Navbar = ({ lenis }: NavbarProps) => {
  const navRef = useRef<HTMLElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { count, toggleCart } = useCart();
  const { closePage } = useVirtualPage();
  const [isHidden, setIsHidden] = useState(false);
  const lastScroll = useRef(0);

  useEffect(() => {
    if (!lenis) return;

    const handleScroll = ({ scroll }: { scroll: number }) => {
      if (scroll > 100 && scroll > lastScroll.current) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      lastScroll.current = scroll;
    };

    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  const scrollToSection = (id: string) => {
    closePage();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      ref={navRef}
      className={`hyper-glass fixed top-0 inset-x-0 z-[100] h-24 transition-all duration-500 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="glass-spotlight" />
      <div className="max-w-[1920px] mx-auto px-6 lg:px-12 h-full flex items-center justify-between relative z-10">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            closePage();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-3xl font-medium tracking-tight relative z-50 group hover-trigger text-foreground"
        >
          lunia
          <span className="text-xs align-top font-sans text-primary group-hover:rotate-12 transition-transform duration-300 inline-block">
            ™
          </span>
        </a>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-10 font-sans text-[11px] uppercase tracking-[0.2em] font-medium text-foreground/80">
          <button
            onClick={() => scrollToSection('products')}
            className="nav-link hover-trigger py-1"
          >
            Collection
          </button>
          <button
            onClick={() => scrollToSection('science')}
            className="nav-link hover-trigger py-1"
          >
            The Science
          </button>
          <button
            onClick={() => scrollToSection('reviews')}
            className="nav-link hover-trigger py-1"
          >
            Results
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6 z-50 text-foreground">
          <button
            onClick={toggleTheme}
            className="hover:text-primary transition-colors hover:scale-110 duration-300 hover-trigger"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => {}}
            className="hover:text-primary transition-colors hover:scale-110 duration-300 hover-trigger"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={toggleCart}
            className="relative hover:text-primary transition-colors group hover-trigger"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {count() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                {count()}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};
