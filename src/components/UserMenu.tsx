import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Package, Heart, Settings, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useSound } from '@/hooks/use-sound';

export const UserMenu = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const { playClick, playHover } = useSound();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();
        
        setProfile(data);
      }
      setLoading(false);
    };

    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    playClick();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      setIsOpen(false);
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />
    );
  }

  if (!user) {
    return (
      <Link
        to="/auth?mode=login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors duration-300"
        onMouseEnter={playHover}
        onClick={playClick}
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:inline">Sign In</span>
      </Link>
    );
  }

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => {
          playClick();
          setIsOpen(!isOpen);
        }}
        onMouseEnter={playHover}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 group"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-primary/30 transition-colors">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs font-medium text-primary">{initials}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-foreground/70 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-xl overflow-hidden z-[200] animate-in fade-in-0 zoom-in-95 duration-200">
          {/* User Info */}
          <div className="p-4 border-b border-border bg-secondary/30">
            <p className="font-medium text-foreground truncate">{displayName}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              to="/profile"
              onClick={() => {
                playClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <User className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground">My Profile</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => {
                playClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <Package className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground">Orders</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => {
                playClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <Heart className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground">Wishlist</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => {
                playClick();
                setIsOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm text-foreground">Settings</span>
            </Link>
          </div>

          {/* Sign Out */}
          <div className="p-2 border-t border-border">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors group w-full"
            >
              <LogOut className="w-4 h-4 text-destructive" />
              <span className="text-sm text-destructive">Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};