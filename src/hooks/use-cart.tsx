import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  tagline: string;
  price: number;
  image: string;
  badge: string | null;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: { id: string | number; name: string; tagline: string; price: number; image: string; badge: string | null }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;
  clearCart: () => void;
  total: () => number;
  count: () => number;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (product) => {
        const productId = String(product.id);
        
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
            items: [...state.items, { 
              id: productId,
              name: product.name,
              tagline: product.tagline,
              price: product.price,
              image: product.image,
              badge: product.badge,
              quantity: 1 
            }],
          };
        });
      },
      
      removeItem: (id: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },
      
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      setCartOpen: (open: boolean) => set({ isOpen: open }),
      clearCart: () => set({ items: [] }),
      
      total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
      
      count: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'lunia-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
