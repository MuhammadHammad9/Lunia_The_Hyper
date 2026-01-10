import { create } from 'zustand';
import { Product, allProducts, bundles } from '@/lib/products';

interface CartItem extends Product {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (productId: number) => void;
  removeItem: (index: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  total: () => number;
  count: () => number;
}

const findProduct = (id: number): Product | undefined => {
  return [...allProducts, ...bundles].find((p) => p.id === id);
};

export const useCart = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,
  
  addItem: (productId: number) => {
    const product = findProduct(productId);
    if (!product) return;
    
    set((state) => {
      const existing = state.items.find((item) => item.id === productId);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { ...product, quantity: 1 }],
      };
    });
  },
  
  removeItem: (index: number) => {
    set((state) => ({
      items: state.items.filter((_, i) => i !== index),
    }));
  },
  
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setCartOpen: (open: boolean) => set({ isOpen: open }),
  
  total: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
  
  count: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));
