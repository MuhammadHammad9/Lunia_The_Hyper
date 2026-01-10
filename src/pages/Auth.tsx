import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Leaf, ArrowRight, Sparkles, Check, Mail, Lock, User } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useSound } from '@/hooks/use-sound';
import { SoundProvider } from '@/hooks/use-sound';

type AuthMode = 'login' | 'signup' | 'forgot-password';

const AuthContent = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get('mode') as AuthMode) || 'login';
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { isDark, initTheme } = useTheme();
  const { playClick, playHover, playSuccess } = useSound();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    playSuccess();
    setIsLoading(false);
  };

  const switchMode = (newMode: AuthMode) => {
    playClick();
    setMode(newMode);
  };

  const animationClass = reducedMotion ? '' : 'auth-animate-in';
  const staggerDelay = (index: number) => 
    reducedMotion ? {} : { animationDelay: `${index * 0.1}s` };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 lg:px-16 xl:px-24 py-12 relative z-10">
        <div className="w-full max-w-md mx-auto">
          {/* Logo */}
          <Link 
            to="/" 
            className={`inline-flex items-center gap-3 mb-12 group ${animationClass}`}
            style={staggerDelay(0)}
            onMouseEnter={playHover}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-2xl text-foreground">
              lunia<span className="text-primary text-xs align-top">™</span>
            </span>
          </Link>

          {/* Header */}
          <div className={`mb-10 ${animationClass}`} style={staggerDelay(1)}>
            <h1 className="font-display text-4xl md:text-5xl text-foreground mb-3">
              {mode === 'login' && 'Welcome back'}
              {mode === 'signup' && 'Begin your journey'}
              {mode === 'forgot-password' && 'Reset password'}
            </h1>
            <p className="text-muted-foreground text-lg">
              {mode === 'login' && 'Continue your skincare ritual'}
              {mode === 'signup' && 'Create your personalized account'}
              {mode === 'forgot-password' && "We'll send you reset instructions"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name field - only for signup */}
            {mode === 'signup' && (
              <div className={`space-y-2 ${animationClass}`} style={staggerDelay(2)}>
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Full name
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-secondary/70"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className={`space-y-2 ${animationClass}`} style={staggerDelay(mode === 'signup' ? 3 : 2)}>
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@lunia.com"
                  className="w-full pl-12 pr-4 py-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-secondary/70"
                  required
                />
              </div>
            </div>

            {/* Password field - not for forgot password */}
            {mode !== 'forgot-password' && (
              <div className={`space-y-2 ${animationClass}`} style={staggerDelay(mode === 'signup' ? 4 : 3)}>
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-4 bg-secondary/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 hover:bg-secondary/70"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPassword(!showPassword);
                      playClick();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors duration-300"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
            )}

            {/* Submit button */}
            <div className={animationClass} style={staggerDelay(mode === 'signup' ? 5 : 4)}>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-elevator btn-elevator-filled rounded-xl overflow-hidden shadow-lg group disabled:opacity-70 disabled:cursor-not-allowed"
                onMouseEnter={playHover}
              >
                <div className="btn-content">
                  <span className="btn-label-initial font-sans text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'forgot-password' && 'Send Reset Link'}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </>
                    )}
                  </span>
                  <span className="btn-label-hover font-sans text-sm uppercase tracking-widest flex items-center justify-center gap-2">
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' && 'Sign In'}
                        {mode === 'signup' && 'Create Account'}
                        {mode === 'forgot-password' && 'Send Reset Link'}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </span>
                </div>
              </button>
            </div>

            {/* Divider - only for login/signup */}
            {mode !== 'forgot-password' && (
              <div className={`flex items-center gap-4 ${animationClass}`} style={staggerDelay(mode === 'signup' ? 6 : 5)}>
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs uppercase tracking-widest text-muted-foreground">or continue with</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Social login buttons */}
            {mode !== 'forgot-password' && (
              <div className={`grid grid-cols-2 gap-4 ${animationClass}`} style={staggerDelay(mode === 'signup' ? 7 : 6)}>
                <button
                  type="button"
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="flex items-center justify-center gap-3 py-4 bg-secondary/50 border border-border rounded-xl hover:bg-secondary hover:border-primary/30 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-sm font-medium text-foreground">GitHub</span>
                </button>
                <button
                  type="button"
                  onClick={playClick}
                  onMouseEnter={playHover}
                  className="flex items-center justify-center gap-3 py-4 bg-secondary/50 border border-border rounded-xl hover:bg-secondary hover:border-primary/30 transition-all duration-300 group"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium text-foreground">Google</span>
                </button>
              </div>
            )}
          </form>

          {/* Footer links */}
          <div className={`mt-10 flex items-center justify-between text-sm ${animationClass}`} style={staggerDelay(mode === 'signup' ? 8 : 7)}>
            {mode === 'login' && (
              <>
                <button onClick={() => switchMode('signup')} className="text-primary hover:text-primary/80 transition-colors">
                  Create an account
                </button>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Privacy
                </Link>
              </>
            )}
            {mode === 'signup' && (
              <>
                <button onClick={() => switchMode('login')} className="text-primary hover:text-primary/80 transition-colors">
                  Already have an account?
                </button>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Terms & Privacy
                </Link>
              </>
            )}
            {mode === 'forgot-password' && (
              <>
                <button onClick={() => switchMode('login')} className="text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                  ← Back to sign in
                </button>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Need help?
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Showcase */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px'
            }}
          />
          
          {/* Floating gradient orbs */}
          {!reducedMotion && (
            <>
              <div 
                className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[100px] animate-float"
                style={{ 
                  background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)',
                  top: '10%',
                  right: '20%'
                }} 
              />
              <div 
                className="absolute w-[400px] h-[400px] rounded-full opacity-15 blur-[80px] animate-float"
                style={{ 
                  background: 'radial-gradient(circle, hsl(var(--accent)) 0%, transparent 70%)',
                  bottom: '20%',
                  left: '10%',
                  animationDelay: '2s'
                }} 
              />
            </>
          )}
        </div>

        {/* Floating cards */}
        <div className="relative w-full h-full flex items-center justify-center p-12">
          {/* Main card */}
          <div className={`relative ${animationClass}`} style={staggerDelay(3)}>
            <div className="hyper-glass rounded-3xl p-8 max-w-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-foreground">Skin Analysis</h3>
                  <p className="text-sm text-muted-foreground">Personalized for you</p>
                </div>
              </div>
              
              {/* Progress bars */}
              <div className="space-y-4">
                {[
                  { label: 'Hydration', value: 85, color: 'bg-primary' },
                  { label: 'Radiance', value: 72, color: 'bg-accent' },
                  { label: 'Elasticity', value: 91, color: 'bg-primary' },
                ].map((item, i) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground/80">{item.label}</span>
                      <span className="text-primary font-medium">{item.value}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                        style={{ 
                          width: reducedMotion ? `${item.value}%` : '0%',
                          animation: reducedMotion ? 'none' : `progressFill 1.5s ease-out ${0.5 + i * 0.2}s forwards`
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating badge */}
            <div 
              className={`absolute -top-6 -right-6 hyper-glass rounded-2xl px-4 py-3 ${animationClass}`}
              style={staggerDelay(5)}
            >
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-medium text-foreground">Premium Member</p>
                </div>
              </div>
            </div>

            {/* Bottom floating card */}
            <div 
              className={`absolute -bottom-10 -left-10 hyper-glass rounded-2xl p-4 ${animationClass}`}
              style={staggerDelay(6)}
            >
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div 
                      key={i}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/60 to-accent/60 border-2 border-background flex items-center justify-center text-[10px] font-medium text-primary-foreground"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="text-foreground font-medium">2,847</span>
                  <span className="text-muted-foreground"> joined today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrap with SoundProvider
const Auth = () => {
  return (
    <SoundProvider>
      <AuthContent />
    </SoundProvider>
  );
};

export default Auth;