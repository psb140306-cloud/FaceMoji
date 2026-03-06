import { create } from "zustand";

interface UIStore {
  isMobileMenuOpen: boolean;
  selectedStickerId: string | null;

  toggleMobileMenu: () => void;
  selectSticker: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileMenuOpen: false,
  selectedStickerId: null,

  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  selectSticker: (id) => set({ selectedStickerId: id }),
}));
