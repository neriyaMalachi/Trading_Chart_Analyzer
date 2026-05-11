import type { AuthSession, AuthTokens, User } from '@tca/types';
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isHydrated: boolean;
  setSession: (session: AuthSession) => void;
  setTokens: (tokens: AuthTokens) => void;
  setUser: (user: User) => void;
  clear: () => void;
  markHydrated: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tokens: null,
  isHydrated: false,
  setSession: (session) => set({ user: session.user, tokens: session.tokens }),
  setTokens: (tokens) => set({ tokens }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, tokens: null }),
  markHydrated: () => set({ isHydrated: true }),
}));
