import { create } from 'zustand';

type VirtualPageType = 'contact' | 'shipping' | 'faq' | 'shop-all' | 'bundles' | 'gift-cards' | null;

interface VirtualPageState {
  currentPage: VirtualPageType;
  openPage: (page: VirtualPageType) => void;
  closePage: () => void;
}

export const useVirtualPage = create<VirtualPageState>((set) => ({
  currentPage: null,
  openPage: (page) => set({ currentPage: page }),
  closePage: () => set({ currentPage: null }),
}));
