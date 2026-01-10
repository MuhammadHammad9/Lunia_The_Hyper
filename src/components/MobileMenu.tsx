import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, User, Package, Heart, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useSound } from '@/hooks/use-sound';
import { useCart } from '@/hooks/use-cart';
import { useVirtualPage } from '@/hooks/use-virtual-page';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const MobileMenu = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null } | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const { playClick } = useSound();
  const { count, toggleCart } = useCart();
  const { closePage } = useVirtualPage();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .maybeSingle();
        setProfile(data);
      }
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', session.user.id)
            .maybeSingle();
          setProfile(data);
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const scrollToSection = (id: string) => {
    closePage();
    playClick();
    setIsOpen(false);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 300);
  };

  const handleSignOutClick = () => {
    playClick();
    setShowLogoutDialog(true);
  };

  const handleSignOutConfirm = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      setIsOpen(false);
      navigate('/');
    }
    setShowLogoutDialog(false);
  };

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary/50 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-foreground" />
        ) : (
          <Menu className="w-6 h-6 text-foreground" />
        )}
      </button>

      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-[150] transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background border-l border-border z-[160] transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <span className="font-display text-2xl text-foreground">Menu</span>
            <button
              onClick={() => {
                playClick();
                setIsOpen(false);
              }}
              className="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-secondary/50 transition-colors"
            >
              <X className="w-6 h-6 text-foreground" />
            </button>
          </div>

          {/* User Section */}
          {user && (
            <div className="p-6 border-b border-border bg-secondary/20">
              <p className="font-medium text-foreground">{displayName}</p>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-2">
              <button
                onClick={() => scrollToSection('products')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors font-medium"
              >
                Collection
              </button>
              <button
                onClick={() => scrollToSection('science')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors font-medium"
              >
                The Science
              </button>
              <button
                onClick={() => scrollToSection('reviews')}
                className="w-full text-left px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors font-medium"
              >
                Results
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 border-t border-border" />

            {/* Quick Actions */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  playClick();
                  setIsOpen(false);
                  toggleCart();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Cart</span>
                {count() > 0 && (
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                    {count()}
                  </span>
                )}
              </button>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => {
                      playClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <User className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => {
                      playClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Package className="w-5 h-5" />
                    <span>Orders</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => {
                      playClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                    <span>Wishlist</span>
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => {
                      playClick();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                </>
              ) : (
                <Link
                  to="/auth?mode=login"
                  onClick={() => {
                    playClick();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-foreground hover:bg-secondary/50 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Sign In</span>
                </Link>
              )}
            </div>
          </nav>

          {/* Footer */}
          {user && (
            <div className="p-6 border-t border-border">
              <button
                onClick={handleSignOutClick}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to sign out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border hover:bg-secondary">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSignOutConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};