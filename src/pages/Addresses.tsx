import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft, MapPin, Plus, Trash2, Check, Home, Building, Edit2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { z } from 'zod';

const addressSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  address_line1: z.string().min(5, 'Address is required'),
  address_line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postal_code: z.string().min(3, 'ZIP code is required'),
  country: z.string().min(2, 'Country is required'),
  phone: z.string().optional(),
  label: z.string().optional(),
  is_default_shipping: z.boolean().optional(),
});

type AddressFormData = z.infer<typeof addressSchema>;

interface Address extends AddressFormData {
  id: string;
  user_id: string;
  created_at: string;
}

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressFormData>({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US',
    phone: '',
    label: 'Home',
    is_default_shipping: false,
  });
  const [errors, setErrors] = useState<Partial<AddressFormData>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .order('is_default_shipping', { ascending: false });

    if (error) {
      console.error('Error fetching addresses:', error);
    } else {
      setAddresses(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: 'US',
      phone: '',
      label: 'Home',
      is_default_shipping: false,
    });
    setErrors({});
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setFormData({
      first_name: address.first_name,
      last_name: address.last_name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state || '',
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      label: address.label || 'Home',
      is_default_shipping: address.is_default_shipping || false,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    try {
      addressSchema.parse(formData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors as Partial<AddressFormData>);
      }
      return;
    }

    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save addresses');
        return;
      }

      // If setting as default, unset other defaults first
      if (formData.is_default_shipping) {
        await supabase
          .from('addresses')
          .update({ is_default_shipping: false })
          .eq('user_id', user.id);
      }

      if (editingId) {
        const { error } = await supabase
          .from('addresses')
          .update(formData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          toast.error('Please sign in to save addresses');
          return;
        }
        
        const insertData = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          address_line1: formData.address_line1,
          address_line2: formData.address_line2 || null,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          phone: formData.phone || null,
          label: formData.label || 'Home',
          is_default_shipping: formData.is_default_shipping || false,
          user_id: authUser.id,
        };
        
        const { error } = await supabase
          .from('addresses')
          .insert([insertData]);

        if (error) throw error;
        toast.success('Address added successfully');
      }

      resetForm();
      fetchAddresses();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Address deleted');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  const setAsDefault = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Unset all defaults
      await supabase
        .from('addresses')
        .update({ is_default_shipping: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default_shipping: true })
        .eq('id', id);

      if (error) throw error;
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('Failed to update default address');
    }
  };

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
        {/* Back link */}
        <Link 
          to="/profile"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-4xl text-foreground">Your Addresses</h1>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Address
            </button>
          )}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-secondary/30 rounded-2xl p-6 border border-border mb-8">
            <h2 className="font-display text-xl text-foreground mb-6">
              {editingId ? 'Edit Address' : 'Add New Address'}
            </h2>
            
            <div className="space-y-4">
              {/* Label Selection */}
              <div className="flex gap-3">
                {['Home', 'Work', 'Other'].map((label) => (
                  <button
                    key={label}
                    onClick={() => setFormData(prev => ({ ...prev, label }))}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      formData.label === label 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-background border-border hover:border-primary/50'
                    }`}
                  >
                    {label === 'Home' && <Home className="w-4 h-4" />}
                    {label === 'Work' && <Building className="w-4 h-4" />}
                    {label === 'Other' && <MapPin className="w-4 h-4" />}
                    {label}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">First Name *</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.first_name ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Last Name *</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.last_name ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line1: e.target.value }))}
                  className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.address_line1 ? 'border-destructive' : 'border-border'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Address Line 2</label>
                <input
                  type="text"
                  value={formData.address_line2}
                  onChange={(e) => setFormData(prev => ({ ...prev, address_line2: e.target.value }))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.city ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.state ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.postal_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                    className={`w-full px-4 py-3 bg-background border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.postal_code ? 'border-destructive' : 'border-border'}`}
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Country *</label>
                  <select
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_default_shipping}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_default_shipping: e.target.checked }))}
                  className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">Set as default shipping address</span>
              </label>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-medium hover:bg-secondary/80 transition-colors border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                  {saving ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Addresses List */}
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16">
            <div className="bg-secondary/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="font-display text-2xl text-foreground mb-2">No addresses saved</h2>
            <p className="text-muted-foreground mb-6">Add an address for faster checkout</p>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`relative bg-secondary/30 rounded-2xl p-6 border transition-colors ${
                  address.is_default_shipping ? 'border-primary' : 'border-border'
                }`}
              >
                {address.is_default_shipping && (
                  <div className="absolute top-4 right-4 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    <Check className="w-3 h-3" />
                    Default
                  </div>
                )}

                <div className="flex items-center gap-2 mb-3">
                  {address.label === 'Home' && <Home className="w-4 h-4 text-primary" />}
                  {address.label === 'Work' && <Building className="w-4 h-4 text-primary" />}
                  {(!address.label || address.label === 'Other') && <MapPin className="w-4 h-4 text-primary" />}
                  <span className="font-medium text-foreground">{address.label || 'Address'}</span>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {address.first_name} {address.last_name}<br />
                  {address.address_line1}<br />
                  {address.address_line2 && <>{address.address_line2}<br /></>}
                  {address.city}, {address.state} {address.postal_code}<br />
                  {address.country}
                  {address.phone && <><br />{address.phone}</>}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(address)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  {!address.is_default_shipping && (
                    <button
                      onClick={() => setAsDefault(address.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-foreground hover:text-primary transition-colors"
                    >
                      <Check className="w-3 h-3" />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-destructive hover:text-destructive/80 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Addresses;
