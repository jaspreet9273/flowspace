// ============================================================
// AUTH STORE (Zustand)
//
// ARCHITECTURE NOTE:
// Only CLIENT-SIDE auth state lives here — what's needed for
// UI rendering after the initial server-rendered HTML.
// The source of truth for auth in a Next.js App Router app
// is the cookie/session on the server. This store mirrors
// that state client-side so components can react to it.
//
// LEARNING: Zustand is lightweight (no Provider, no boilerplate).
// For per-component server data, use TanStack Query instead.
// ============================================================

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      isAuthenticated: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => sessionStorage),
      // Only persist non-sensitive UI state
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// Selector hooks — avoids unnecessary re-renders by selecting slices
export const useCurrentUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
