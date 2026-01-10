import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Search, ShoppingBag, Volume2, VolumeX } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useCart } from '@/hooks/use-cart';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import { useSound } from '@/hooks/use-sound';
import { UserMenu } from '@/components/UserMenu';
import { MobileMenu } from '@/components/MobileMenu';
import Lenis from 'lenis';

interface NavbarProps {
  lenis: Lenis | null;
}

export const Navbar = ({ lenis }: NavbarProps) => {
  const navRef = useRef<HTMLElement>(null);
  const { isDark, toggleTheme } = useTheme();
  const { count, toggleCart } = useCart();
  const { closePage } = useVirtualPage();
  const { isSoundEnabled, toggleSoundEnabled, playClick, playToggle } = useSound();
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
    playClick();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleThemeToggle = () => {
    playToggle();
    toggleTheme();
  };

  const handleSoundToggle = () => {
    toggleSoundEnabled();
  };

  return (
    <nav
      ref={navRef}
      className={`hyper-glass fixed top-0 inset-x-0 z-[100] h-20 md:h-24 transition-all duration-500 !overflow-visible ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <div className="glass-spotlight" />
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-12 h-full flex items-center justify-between relative z-10">
        {/* Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            closePage();
            playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-2xl md:text-3xl font-medium tracking-tight relative z-50 group hover-trigger text-foreground"
        >
          lunia
          <span className="text-xs align-top font-sans text-primary group-hover:rotate-12 transition-transform duration-300 inline-block">
            ™
          </span>
        </a>

        {/* Navigation Links - Hidden on mobile */}
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
        <div className="flex items-center gap-3 sm:gap-6 z-50 text-foreground">
          {/* Sound Toggle - Hidden on mobile */}
          <button
            onClick={handleSoundToggle}
            className="relative hover:text-primary transition-all hover:scale-110 duration-300 hover-trigger group hidden sm:block"
            aria-label={isSoundEnabled ? 'Disable sound' : 'Enable sound'}
          >
            <div className="relative">
              {isSoundEnabled ? (
                <Volume2 className="w-5 h-5 transition-transform duration-300" />
              ) : (
                <VolumeX className="w-5 h-5 transition-transform duration-300" />
              )}
              {isSoundEnabled && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
              )}
            </div>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="hover:text-primary transition-colors hover:scale-110 duration-300 hover-trigger"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Search - Hidden on mobile */}
          <button
            onClick={() => playClick()}
            className="hover:text-primary transition-colors hover:scale-110 duration-300 hover-trigger hidden sm:block"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Cart */}
          <button
            onClick={() => {
              playClick();
              toggleCart();
            }}
            className="relative hover:text-primary transition-colors group hover-trigger"
            aria-label="Shopping cart"
          >
            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
            {count() > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                {count()}
              </span>
            )}
          </button>

          {/* User Menu - Hidden on mobile */}
          <div className="hidden md:block">
            <UserMenu />
          </div>

          {/* Mobile Menu */}
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
};