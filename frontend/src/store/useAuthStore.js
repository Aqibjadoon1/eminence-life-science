/**
 * Global auth state — Zustand store.
 * Token stored in httpOnly cookie (server-managed).
 * Frontend only tracks the user object.
 */
import { create } from 'zustand';
import { AuthService } from '../services/AuthService.js';

const useAuthStore = create((set) => ({
  user:        null,
  isLoading:   true,   // true until initial /me check completes
  isLoggedIn:  false,

  // Boot: check if user is already logged in (httpOnly cookie still valid)
  init: async () => {
    try {
      const { user } = await AuthService.me();
      set({ user, isLoggedIn: true, isLoading: false });
    } catch {
      set({ user: null, isLoggedIn: false, isLoading: false });
    }
  },

  register: async (data) => {
    const { user } = await AuthService.register(data);
    set({ user, isLoggedIn: true });
    return user;
  },

  login: async (data) => {
    const { user } = await AuthService.login(data);
    set({ user, isLoggedIn: true });
    return user;
  },

  logout: async () => {
    await AuthService.logout();
    set({ user: null, isLoggedIn: false });
  },
}));

export default useAuthStore;
