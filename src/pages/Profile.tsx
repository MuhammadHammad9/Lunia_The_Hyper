import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, Heart, MapPin, CreditCard, LogOut, Leaf, ChevronRight, Camera } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as SupabaseUser } from '@supabase/supabase-js';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ full_name: string | null; avatar_url: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', user.id)
          .single();
        
        setProfile(data);
      }
      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Error signing out');
    } else {
      toast.success('Signed out successfully');
      navigate('/');
    }
  };

  const menuItems = [
    { icon: User, label: 'Account Settings', href: '/profile', description: 'Manage your personal information' },
    { icon: Package, label: 'Orders', href: '/orders', description: 'Track your orders and history' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', description: 'Your saved products' },
    { icon: MapPin, label: 'Addresses', href: '/addresses', description: 'Manage delivery addresses' },
    { icon: CreditCard, label: 'Payment Methods', href: '/profile', description: 'Your saved payment options' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center gap-6 mb-12">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-primary" />
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h1 className="font-display text-3xl text-foreground mb-1">
              {profile?.full_name || user?.user_metadata?.full_name || 'Welcome'}
            </h1>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2 mb-12">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 border border-transparent hover:border-border transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-4 p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 border border-transparent hover:border-destructive/30 transition-all duration-300 group w-full"
        >
          <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
            <LogOut className="w-5 h-5 text-destructive" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-medium text-destructive">Sign Out</h3>
            <p className="text-sm text-destructive/70">Log out of your account</p>
          </div>
        </button>
      </main>
    </div>
  );
};

export default Profile;
