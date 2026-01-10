import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Plus, Gift, Send, CreditCard, Check, Sparkles } from 'lucide-react';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import { allProducts, bundles, Product, giftCardProduct } from '@/lib/products';
import { ProductCard } from './ProductCard';
import { useCart } from '@/hooks/use-cart';
import { useSound } from '@/hooks/use-sound';
import Lenis from '@studio-freight/lenis';

interface VirtualPagesProps {
  lenis: Lenis | null;
}

export const VirtualPages = ({ lenis }: VirtualPagesProps) => {
  const { currentPage, closePage } = useVirtualPage();
  const [giftAmount, setGiftAmount] = useState(100);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [giftMessage, setGiftMessage] = useState('');
  const [addedToCart, setAddedToCart] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);
  const { addItem } = useCart();
  const { playClick, playPageOpen, playPageClose } = useSound();

  useEffect(() => {
    if (currentPage) {
      lenis?.stop();
      document.body.style.overflow = 'hidden';
      playPageOpen();
      
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
      playPageClose();
      
      if (pageRef.current) {
        gsap.to(pageRef.current, {
          y: '100%',
          duration: 0.8,
          ease: 'power4.inOut',
        });
      }
    }
  }, [currentPage, lenis, playPageOpen, playPageClose]);

  const handleAddGiftCard = () => {
    addItem({
      id: giftCardProduct.id,
      name: giftCardProduct.name,
      tagline: giftCardProduct.tagline,
      price: giftAmount, // Use selected gift amount
      image: giftCardProduct.image,
      badge: giftCardProduct.badge,
    });
    setAddedToCart(true);
    playClick();
    setTimeout(() => setAddedToCart(false), 2000);
  };

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
    {
      question: 'What makes Lunia different from other skincare brands?',
      answer:
        "Our products combine cutting-edge biotechnology with ethically sourced natural ingredients. Each formula is backed by 15 years of clinical research and contains our proprietary Bio-Regeneration Complex™.",
    },
    {
      question: 'Do you test on animals?',
      answer:
        "Never. Lunia is proudly cruelty-free and certified by Leaping Bunny. We believe beautiful skin should never come at the expense of our animal friends.",
    },
    {
      question: 'What is your return policy?',
      answer:
        "We offer a 60-day satisfaction guarantee. If you're not completely happy with your purchase, return it for a full refund. We believe in our products that much.",
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
            <div className="space-y-4 pb-20">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="faq-item group border-b border-foreground/10 pb-4"
                >
                  <button
                    onClick={() => {
                      setActiveFaq(activeFaq === index ? null : index);
                      playClick();
                    }}
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
                <ProductCard key={product.id} product={{
                  id: product.id,
                  name: product.name,
                  tagline: product.tagline,
                  price: product.price,
                  image: product.image,
                  badge: product.badge,
                }} />
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
                <ProductCard key={bundle.id} product={{
                  id: bundle.id,
                  name: bundle.name,
                  tagline: bundle.tagline,
                  price: bundle.price,
                  image: bundle.image,
                  badge: bundle.badge,
                }} />
              ))}
            </div>
          </div>
        );

      case 'gift-cards':
        return (
          <div className="max-w-[1920px] mx-auto w-full min-h-full flex flex-col relative z-10 pt-20 pb-32">
            <div className="flex justify-between items-end mb-16">
              <div>
                <span className="font-sans text-xs uppercase tracking-widest text-primary mb-2 block flex items-center gap-2">
                  <Gift className="w-4 h-4" /> The Gift of Radiance
                </span>
                <h1 className="font-display text-fluid-h2 text-foreground">Gift Cards</h1>
              </div>
              <CloseButton onClick={closePage} />
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Gift Card Preview */}
              <div className="space-y-8">
                <div className="relative w-full aspect-[1.6/1] rounded-2xl overflow-hidden shadow-2xl group perspective-1000">
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80 p-8 md:p-12 flex flex-col justify-between transition-transform duration-700 preserve-3d group-hover:scale-[1.02]"
                  >
                    {/* Card shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]" style={{ transition: 'transform 0.7s ease-out, opacity 0.3s' }} />
                    
                    {/* Top row */}
                    <div className="flex justify-between items-start relative z-10">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-gold" />
                        <span className="font-display text-2xl md:text-3xl italic text-primary-foreground">
                          Lunia
                        </span>
                      </div>
                      <span className="font-display text-xl md:text-2xl text-primary-foreground/90">
                        ${giftAmount}
                      </span>
                    </div>

                    {/* Middle - Decorative pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%]">
                        {[...Array(8)].map((_, i) => (
                          <div
                            key={i}
                            className="absolute top-1/2 left-1/2 border border-white/30 rounded-full"
                            style={{
                              width: `${(i + 1) * 80}px`,
                              height: `${(i + 1) * 80}px`,
                              transform: 'translate(-50%, -50%)',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Bottom row */}
                    <div className="space-y-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded bg-gradient-to-r from-gold/60 to-gold/30 border border-gold/40" />
                        <CreditCard className="w-5 h-5 text-primary-foreground/40" />
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="font-mono text-xs text-primary-foreground/50 tracking-widest">
                          GIFT CARD
                        </p>
                        <p className="font-sans text-[10px] text-primary-foreground/40 uppercase tracking-widest">
                          Never expires
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card benefits */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { icon: Gift, label: 'Beautifully Packaged' },
                    { icon: Send, label: 'Instant Delivery' },
                    { icon: Check, label: 'Never Expires' },
                  ].map((benefit, i) => (
                    <div key={i} className="text-center p-4 rounded-lg bg-secondary/50 border border-foreground/5">
                      <benefit.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
                      <span className="text-[10px] uppercase tracking-widest text-foreground/60">{benefit.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gift Card Form */}
              <div className="space-y-8">
                <div>
                  <h3 className="font-display text-2xl italic text-foreground mb-6">
                    Select Amount
                  </h3>
                  <div className="grid grid-cols-4 gap-3">
                    {[50, 100, 150, 200].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setGiftAmount(amount);
                          playClick();
                        }}
                        className={`p-4 md:p-6 border rounded-lg transition-all duration-300 hover-trigger ${
                          giftAmount === amount
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/10'
                            : 'border-foreground/10 hover:border-primary/50 bg-secondary/30'
                        }`}
                      >
                        <span className={`block font-display text-xl md:text-2xl ${
                          giftAmount === amount ? 'text-primary' : 'text-foreground'
                        }`}>
                          ${amount}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="font-display text-2xl italic text-foreground">
                    Personalize Your Gift
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">
                        Recipient's Name
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="Their name"
                        className="w-full bg-secondary/50 border border-foreground/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">
                        Recipient's Email
                      </label>
                      <input
                        type="email"
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="their@email.com"
                        className="w-full bg-secondary/50 border border-foreground/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-secondary/50 border border-foreground/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/30"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-foreground/50 mb-2 block">
                      Personal Message (Optional)
                    </label>
                    <textarea
                      value={giftMessage}
                      onChange={(e) => setGiftMessage(e.target.value)}
                      placeholder="Write a heartfelt message..."
                      rows={3}
                      className="w-full bg-secondary/50 border border-foreground/10 rounded-lg px-4 py-3 outline-none focus:border-primary transition-colors text-foreground placeholder:text-foreground/30 resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddGiftCard}
                  disabled={addedToCart}
                  className={`w-full btn-elevator rounded-full overflow-hidden shadow-lg hover-trigger transition-all duration-500 ${
                    addedToCart 
                      ? 'bg-primary/20 border-primary' 
                      : 'btn-elevator-filled'
                  }`}
                >
                  <div className="btn-content">
                    <span className="btn-label-initial font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      {addedToCart ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Cart
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" /> Add ${giftAmount} Gift Card to Cart
                        </>
                      )}
                    </span>
                    <span className="btn-label-hover font-sans text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                      {addedToCart ? (
                        <>
                          <Check className="w-4 h-4" /> Added to Cart
                        </>
                      ) : (
                        <>
                          <Gift className="w-4 h-4" /> Add ${giftAmount} Gift Card to Cart
                        </>
                      )}
                    </span>
                  </div>
                </button>

                <p className="text-center text-xs text-foreground/40">
                  Gift cards are delivered instantly via email and never expire.
                </p>
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

const CloseButton = ({ onClick }: { onClick: () => void }) => {
  const { playClick } = useSound();
  
  return (
    <button
      onClick={() => {
        playClick();
        onClick();
      }}
      className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center text-foreground hover:bg-primary hover:text-primary-foreground transition-all hover-trigger group"
    >
      <X className="w-6 h-6 transition-transform duration-300 group-hover:rotate-90" />
    </button>
  );
};
