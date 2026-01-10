import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Leaf, ArrowLeft, Truck, Shield, CheckCircle, Package, AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useCart } from '@/hooks/use-cart';
import { useDiscountCode } from '@/hooks/use-discount-code';
import { toast } from 'sonner';
import { z } from 'zod';
import { PromoCodeInput } from '@/components/PromoCodeInput';

// Validation schemas
const shippingSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required').max(20),
  address: z.string().min(5, 'Address is required').max(200),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  zipCode: z.string().min(3, 'ZIP code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

const Checkout = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const { items, total, clearCart } = useCart();
  const { appliedDiscount, removeDiscount, calculateDiscountedTotal } = useDiscountCode();
  
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
  });
  
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});

  // Handle Stripe redirect
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const canceled = searchParams.get('canceled');
    
    if (sessionId) {
      // Payment successful
      clearCart();
      removeDiscount();
      setOrderComplete(true);
      setOrderNumber(sessionId.slice(-12).toUpperCase());
    }
    
    if (canceled) {
      toast.error('Payment was canceled. Please try again.');
    }
  }, [searchParams, clearCart, removeDiscount]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        const nameParts = user.user_metadata?.full_name?.split(' ') || [];
        setShippingData(prev => ({
          ...prev,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          email: user.email || '',
        }));
      }
    });
  }, []);

  const steps = [
    { number: 1, label: 'Shipping', icon: Truck },
    { number: 2, label: 'Payment', icon: CreditCard },
  ];

  const validateShipping = (): boolean => {
    try {
      shippingSchema.parse(shippingData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<ShippingFormData> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ShippingFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleShippingContinue = () => {
    if (validateShipping()) {
      setStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStripeCheckout = async () => {
    if (!user) {
      toast.error('Please sign in to complete your order');
      return;
    }

    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          items: items.map(item => ({
            product_id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          shipping_address: {
            first_name: shippingData.firstName,
            last_name: shippingData.lastName,
            address: shippingData.address,
            city: shippingData.city,
            state: shippingData.state,
            zip_code: shippingData.zipCode,
            country: shippingData.country,
            phone: shippingData.phone,
          },
          customer_email: shippingData.email,
          discount_code_id: appliedDiscount?.discount_code_id,
          discount_amount: calculateDiscountedTotal(subtotal).discountAmount,
          success_url: `${window.location.origin}/checkout?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/checkout?canceled=true`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to create checkout session. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const subtotal = total();
  const { discountAmount, finalTotal } = calculateDiscountedTotal(subtotal);
  const tax = finalTotal * 0.08;
  const grandTotal = finalTotal + tax;

  // Order confirmation screen
  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-2xl text-foreground">
                lunia<span className="text-primary text-xs align-top">™</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-2xl text-center">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="w-10 h-10 text-primary" />
          </div>
          
          <h1 className="font-display text-4xl text-foreground mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-muted-foreground mb-2">
            Thank you for your order
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Order reference: <span className="font-mono text-foreground">{orderNumber}</span>
          </p>

          <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-8">
            <p className="text-primary font-medium">
              ✓ Payment Confirmed
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Your payment has been processed securely via Stripe
            </p>
          </div>

          <p className="text-sm text-muted-foreground mb-8">
            We&apos;ll send you a confirmation email with tracking details shortly.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </Link>
            <Link
              to="/orders"
              className="px-8 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border border-border"
            >
              View Orders
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Empty cart state
  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                <Leaf className="w-5 h-5 text-primary" />
              </div>
              <span className="font-display text-2xl text-foreground">
                lunia<span className="text-primary text-xs align-top">™</span>
              </span>
            </Link>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 max-w-2xl text-center">
          <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl text-foreground mb-4">Your cart is empty</h1>
          <p className="text-muted-foreground mb-8">Add some products to checkout</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-2xl text-foreground">
              lunia<span className="text-primary text-xs align-top">™</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Secure Checkout</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-5xl">
        {/* Back link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to shop</span>
        </Link>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {steps.map((s, index) => (
            <div key={s.number} className="flex items-center">
              <button
                onClick={() => s.number < step && setStep(s.number)}
                disabled={s.number > step}
                className={`flex items-center gap-2 ${step >= s.number ? 'text-primary' : 'text-muted-foreground'} ${s.number < step ? 'cursor-pointer hover:opacity-80' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-sm transition-colors ${
                  step > s.number 
                    ? 'bg-primary text-primary-foreground' 
                    : step === s.number 
                      ? 'bg-primary/20 text-primary border-2 border-primary' 
                      : 'bg-secondary text-muted-foreground'
                }`}>
                  {step > s.number ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className="hidden sm:inline font-medium">{s.label}</span>
              </button>
              {index < steps.length - 1 && (
                <div className={`w-12 sm:w-24 h-0.5 mx-2 transition-colors ${step > s.number ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Step 1: Shipping */}
            {step === 1 && (
              <div className="bg-secondary/30 rounded-2xl p-6 lg:p-8 border border-border">
                <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-3">
                  <Truck className="w-6 h-6 text-primary" />
                  Shipping Information
                </h2>
                
                <form onSubmit={(e) => { e.preventDefault(); handleShippingContinue(); }} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name *</label>
                      <input
                        type="text"
                        value={shippingData.firstName}
                        onChange={(e) => setShippingData(prev => ({ ...prev, firstName: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.firstName ? 'border-destructive' : 'border-border'}`}
                        placeholder="John"
                      />
                      {errors.firstName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name *</label>
                      <input
                        type="text"
                        value={shippingData.lastName}
                        onChange={(e) => setShippingData(prev => ({ ...prev, lastName: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.lastName ? 'border-destructive' : 'border-border'}`}
                        placeholder="Doe"
                      />
                      {errors.lastName && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email *</label>
                      <input
                        type="email"
                        value={shippingData.email}
                        onChange={(e) => setShippingData(prev => ({ ...prev, email: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.email ? 'border-destructive' : 'border-border'}`}
                        placeholder="john@example.com"
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Phone *</label>
                      <input
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData(prev => ({ ...prev, phone: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.phone ? 'border-destructive' : 'border-border'}`}
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Address *</label>
                    <input
                      type="text"
                      value={shippingData.address}
                      onChange={(e) => setShippingData(prev => ({ ...prev, address: e.target.value }))}
                      className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.address ? 'border-destructive' : 'border-border'}`}
                      placeholder="123 Skincare Street"
                    />
                    {errors.address && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.address}
                      </p>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">City *</label>
                      <input
                        type="text"
                        value={shippingData.city}
                        onChange={(e) => setShippingData(prev => ({ ...prev, city: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.city ? 'border-destructive' : 'border-border'}`}
                        placeholder="Los Angeles"
                      />
                      {errors.city && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.city}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">State *</label>
                      <input
                        type="text"
                        value={shippingData.state}
                        onChange={(e) => setShippingData(prev => ({ ...prev, state: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.state ? 'border-destructive' : 'border-border'}`}
                        placeholder="CA"
                      />
                      {errors.state && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.state}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">ZIP *</label>
                      <input
                        type="text"
                        value={shippingData.zipCode}
                        onChange={(e) => setShippingData(prev => ({ ...prev, zipCode: e.target.value }))}
                        className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.zipCode ? 'border-destructive' : 'border-border'}`}
                        placeholder="90001"
                      />
                      {errors.zipCode && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.zipCode}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Country *</label>
                    <select
                      value={shippingData.country}
                      onChange={(e) => setShippingData(prev => ({ ...prev, country: e.target.value }))}
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-6 py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Continue to Payment
                  </button>
                </form>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-secondary/30 rounded-2xl p-6 lg:p-8 border border-border">
                <h2 className="font-display text-2xl text-foreground mb-6 flex items-center gap-3">
                  <CreditCard className="w-6 h-6 text-primary" />
                  Payment
                </h2>

                {/* Shipping Address Summary */}
                <div className="mb-6 p-4 bg-background rounded-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-foreground">Shipping Address</h3>
                    <button 
                      onClick={() => setStep(1)}
                      className="text-sm text-primary hover:underline"
                    >
                      Edit
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {shippingData.firstName} {shippingData.lastName}<br />
                    {shippingData.address}<br />
                    {shippingData.city}, {shippingData.state} {shippingData.zipCode}<br />
                    {shippingData.country}
                  </p>
                </div>

                {/* Payment Method Info */}
                <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-primary" />
                    <h3 className="font-medium text-foreground">Secure Payment via Stripe</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    You'll be redirected to Stripe's secure checkout to complete your payment.
                    We accept all major credit cards, Apple Pay, and Google Pay.
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="font-medium text-foreground mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-4 bg-background rounded-xl border border-border">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border border-border"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleStripeCheckout}
                    disabled={isSubmitting}
                    className="flex-1 py-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Pay ${grandTotal.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-secondary/30 rounded-2xl p-6 border border-border sticky top-24">
              <h3 className="font-display text-xl text-foreground mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-border max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
              <div className="mb-6 pb-6 border-b border-border">
                <PromoCodeInput orderTotal={subtotal} />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount{appliedDiscount && ` (${appliedDiscount.code})`}</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-primary">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (8%)</span>
                  <span className="text-foreground">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-border">
                  <span className="text-foreground">Total</span>
                  <span className="text-primary">${grandTotal.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 justify-center text-xs text-primary">
                  <Shield className="w-4 h-4" />
                  <span>Secure Stripe Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;