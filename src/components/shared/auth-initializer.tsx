"use client";

// ============================================================
// AUTH INITIALIZER
//
// LEARNING: This component runs once on mount and syncs the
// server session cookie into the Zustand auth store so all
// Client Components can read `useCurrentUser()`.
//
// This is the "hydration bridge" between server auth state
// (cookie) and client auth state (Zustand).
// ============================================================

import { useEffect } from "react";
import { useAuthStore } from "@/stores/auth.store";
import type { AuthUser } from "@/types";

interface AuthInitializerProps {
  user: AuthUser | null;
}

export function AuthInitializer({ user }: AuthInitializerProps) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    setUser(user);
  }, [user, setUser]);

  return null;
}
