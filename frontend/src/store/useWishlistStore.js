/**
 * Wishlist store — persisted to localStorage so it survives page refresh.
 * No backend sync required for now; products are stored by id + snapshot data.
 */
import { create } from 'zustand';

const STORAGE_KEY = 'els_wishlist';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // swallow quota errors
  }
}

const useWishlistStore = create((set, get) => ({
  items: loadFromStorage(),

  // Derived
  isWishlisted: (productId) => get().items.some((i) => i.id === productId),

  toggle: (product) => {
    const current = get().items;
    const exists  = current.some((i) => i.id === product.id);
    const next    = exists
      ? current.filter((i) => i.id !== product.id)
      : [...current, product];
    saveToStorage(next);
    set({ items: next });
    return !exists; // true = added, false = removed
  },

  remove: (productId) => {
    const next = get().items.filter((i) => i.id !== productId);
    saveToStorage(next);
    set({ items: next });
  },

  clear: () => {
    saveToStorage([]);
    set({ items: [] });
  },
}));

export default useWishlistStore;
