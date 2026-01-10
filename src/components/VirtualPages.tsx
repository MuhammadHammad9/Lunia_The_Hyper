import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Plus } from 'lucide-react';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import { allProducts, bundles, Product } from '@/lib/products';
import { ProductCard } from './ProductCard';
import { useCart } from '@/hooks/use-cart';
import Lenis from '@studio-freight/lenis';

interface VirtualPagesProps {
  lenis: Lenis | null;
}

export const VirtualPages = ({ lenis }: VirtualPagesProps) => {
  const { currentPage, closePage } = useVirtualPage();
  const [giftAmount, setGiftAmount] = useState(100);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();

  useEffect(() => {
    if (currentPage) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      
      if (pageRef.current) {
        gsap.to(pageRef.current, {
          y: 0,
          duration: 0.8,
          ease: 'power4.inOut',
        });
      }
    } else {
      lenis?.start();
      document.body.style.overflow = '';
      
      if (pageRef.current) {
        gsap.to(pageRef.current, {
          y: '100%',
          duration: 0.8,
          ease: 'power4.inOut',
        });
      }
    }
  }, [currentPage, lenis]);

  const faqs = [
    {
      question: 'Is Lunia suitable for sensitive skin?',
      answer:
        "Absolutely. Our formulas are hypoallergenic and free from synthetic fragrances, parabens, and sulfates. We specifically formulate with calming botanicals like Centella Asiatica to soothe reactive skin.",
    },
    {
      question: 'How do I use the Regenerating Serum?',
      answer:
        "Apply 2-3 pumps to clean, dry skin morning and night. Gently pat (don't rub) into the face and neck until fully absorbed. Follow with our Hydrating Cream for best results.",
    },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'contact':
        return (
          <div className="max-w-[1920px] mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-start mb-20">
              <h1 className="font-display text-fluid-h2 text-foreground">Contact Us</h1>
              <CloseButton onClick={closePage} />
            </div>
            <div className="grid lg:grid-cols-2 gap-20">
              <div>
                <p className="font-sans text-lg text-foreground/60 max-w-md mb-12">
                  Have a question about our products or your regimen? Our skin experts are here to help.
                </p>
                <div className="space-y-8">
                  <div>
                    <h3 className="font-display text-xl italic mb-2 text-foreground">Email</h3>
                    <p className="text-foreground/60">support@lunia.com</p>
                  </div>
                  <div>
                    <h3 className="font-display text-xl italic mb-2 text-foreground">Press</h3>
                    <p className="text-foreground/60">press@lunia.com</p>
                  </div>
                </div>
              </div>
              <form className="space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <input
                    type="text"
                    placeholder="Name"
                    className="bg-transparent border-b border-foreground/20 py-4 outline-none focus:border-primary transition-colors text-foreground"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    className="bg-transparent border-b border-foreground/20 py-4 outline-none focus:border-primary transition-colors text-foreground"
                  />
                </div>
                <textarea
                  placeholder="Message"
                  rows={4}
                  className="w-full bg-transparent border-b border-foreground/20 py-4 outline-none focus:border-primary transition-colors text-foreground resize-none"
                />
                <button
                  type="button"
                  className="btn-elevator btn-elevator-filled hover-trigger group rounded-full overflow-hidden shadow-lg w-full"
                >
                  <div className="btn-content">
                    <span className="btn-label-initial font-sans text-xs uppercase tracking-widest">
                      Send Message
                    </span>
                    <span className="btn-label-hover font-sans text-xs uppercase tracking-widest">
                      Send Message
                    </span>
                  </div>
                </button>
              </form>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="max-w-4xl mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-start mb-12">
              <h1 className="font-display text-fluid-h2 text-foreground">Shipping & Returns</h1>
              <CloseButton onClick={closePage} />
            </div>
            <div className="space-y-16 pb-20">
              <div>
                <h3 className="font-display text-2xl italic text-primary mb-4">Global Delivery</h3>
                <p className="font-sans text-foreground/70 leading-relaxed mb-6">
                  We are pleased to offer complimentary express shipping on all orders over $150.
                  All Lunia packages are dispatched from our Beverly Hills facility within 24 hours
                  of purchase.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { label: 'Domestic (USA)', value: '2-3 Business Days' },
                    { label: 'International', value: '5-7 Business Days' },
                    { label: 'Courier', value: 'DHL / FedEx' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-6 bg-secondary rounded-lg border border-foreground/5 hover:border-primary/50 transition-colors duration-300 group"
                    >
                      <span className="text-xs uppercase tracking-widest text-foreground/50 group-hover:text-primary transition-colors">
                        {item.label}
                      </span>
                      <div className="font-display text-xl mt-2 text-foreground">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'faq':
        return (
          <div className="max-w-3xl mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-start mb-16">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block">
                  Support
                </span>
                <h1 className="font-display text-fluid-h2 text-foreground">FAQ</h1>
              </div>
              <CloseButton onClick={closePage} />
            </div>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item group border-b border-foreground/10 pb-4"
                >
                  <button
                    onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                    className="w-full flex justify-between items-center py-4 text-left hover-trigger"
                  >
                    <span className="font-display text-xl md:text-2xl text-foreground group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                    <Plus
                      className={`w-5 h-5 text-foreground/50 transition-transform duration-300 ${
                        activeFaq === index ? 'rotate-45' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
                      activeFaq === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="font-sans text-foreground/60 pb-6 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'shop-all':
        return (
          <div className="max-w-[1920px] mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block">
                  The Complete Archive
                </span>
                <h1 className="font-display text-fluid-h2 text-foreground">All Products</h1>
              </div>
              <CloseButton onClick={closePage} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-32">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        );

      case 'bundles':
        return (
          <div className="max-w-[1920px] mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block">
                  Curated Rituals
                </span>
                <h1 className="font-display text-fluid-h2 text-foreground">Sets & Bundles</h1>
              </div>
              <CloseButton onClick={closePage} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
              {bundles.map((bundle) => (
                <ProductCard key={bundle.id} product={bundle} />
              ))}
            </div>
          </div>
        );

      case 'gift-cards':
        return (
          <div className="max-w-[1920px] mx-auto w-full min-h-full flex flex-col relative z-10 pt-20">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block">
                  The Gift of Radiance
                </span>
                <h1 className="font-display text-fluid-h2 text-foreground">Gift Cards</h1>
              </div>
              <CloseButton onClick={closePage} />
            </div>
            <div className="grid lg:grid-cols-2 gap-20 items-center pb-32">
              {/* Gift Card Preview */}
              <div className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl group perspective-1000">
                <div className="absolute inset-0 bg-gradient-to-br from-charcoal via-gray-900 to-black dark:from-white dark:via-alabaster dark:to-gray-200 p-12 flex flex-col justify-between transition-transform duration-700 preserve-3d group-hover:rotate-y-12">
                  <div className="flex justify-between items-start">
                    <span className="font-display text-3xl italic text-primary-foreground dark:text-foreground">
                      Lunia
                    </span>
                    <span className="font-sans text-sm uppercase tracking-widest text-primary-foreground/60 dark:text-foreground/60">
                      ${giftAmount}.00
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="w-12 h-8 rounded bg-gradient-to-r from-gold/40 to-gold/10 border border-gold/30" />
                    <p className="font-mono text-xs text-primary-foreground/40 dark:text-foreground/40">
                      **** **** **** 4291
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent skew-x-12 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-10">
                <p className="font-display text-2xl text-foreground/80 italic">
                  Select an amount to gift.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[50, 100, 200].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setGiftAmount(amount)}
                      className={`btn-elevator p-6 border transition-all hover-trigger ${
                        giftAmount === amount
                          ? 'border-primary bg-primary/5'
                          : 'border-foreground/20 hover:border-primary'
                      }`}
                    >
                      <span className="block font-display text-xl text-foreground">
                        ${amount}
                      </span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => addItem(999)}
                  className="w-full btn-elevator btn-elevator-filled py-6 rounded-full overflow-hidden shadow-lg hover-trigger"
                >
                  <div className="btn-content">
                    <span className="btn-label-initial font-sans text-xs uppercase tracking-widest">
                      Add to Cart
                    </span>
                    <span className="btn-label-hover font-sans text-xs uppercase tracking-widest">
                      Add to Cart
                    </span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (!currentPage) return null;

  return (
    <div
      ref={pageRef}
      className="virtual-page p-6 lg:p-12"
      style={{ transform: 'translateY(100%)', display: 'block' }}
    >
      <div className="page-blob" />
      {renderPage()}
    </div>
  );
};

const CloseButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all hover-trigger"
  >
    <X className="w-6 h-6" />
  </button>
);
