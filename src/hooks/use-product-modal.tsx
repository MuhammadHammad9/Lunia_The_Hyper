import { create } from 'zustand';
import { DisplayProduct } from '@/components/ProductCard';

interface ProductModalState {
  isOpen: boolean;
  product: DisplayProduct | null;
  openModal: (product: DisplayProduct) => void;
  closeModal: () => void;
}

export const useProductModal = create<ProductModalState>((set) => ({
  isOpen: false,
  product: null,
  openModal: (product) => set({ isOpen: true, product }),
  closeModal: () => set({ isOpen: false, product: null }),
}));
