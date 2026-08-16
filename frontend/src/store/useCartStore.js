/**
 * Global cart state — Zustand store.
 * Syncs with backend; also handles optimistic UI for snappy feel.
 */
import { create } from 'zustand';
import { CartService } from '../services/CartService.js';

const useCartStore = create((set, get) => ({
  items:       [],
  isOpen:      false,
  isLoading:   false,
  error:       null,

  // ── Derived getters ──────────────────────────────────────
  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  // ── Actions ──────────────────────────────────────────────
  openCart:  () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart:() => set((s) => ({ isOpen: !s.isOpen })),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const { data } = await CartService.get();
      set({ items: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addItem: async (product_id, quantity = 1) => {
    set({ isLoading: true, isOpen: true });
    try {
      const { data } = await CartService.add(product_id, quantity);
      set({ items: data, isLoading: false });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  updateItem: async (itemId, quantity) => {
    try {
      const { data } = await CartService.update(itemId, quantity);
      set({ items: data });
    } catch (err) {
      set({ error: err.message });
    }
  },

  removeItem: async (itemId) => {
    // Optimistic: remove locally first
    set((s) => ({ items: s.items.filter((i) => i.id !== itemId) }));
    try {
      const { data } = await CartService.remove(itemId);
      set({ items: data });
    } catch (err) {
      set({ error: err.message });
      // Re-fetch to reconcile
      get().fetchCart();
    }
  },

  clearCart: async () => {
    set({ items: [] });
    try {
      await CartService.clear();
    } catch {
      get().fetchCart();
    }
  },

  mergeCart: async () => {
    try {
      const { data } = await CartService.merge();
      set({ items: data });
    } catch {
      // non-fatal
    }
  },
}));

export default useCartStore;
