import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  appUser: any | null;
  isLoading: boolean;
  setAuth: (user: User | null, appUser: any | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  isLoading: true,
  setAuth: (user, appUser) => set({ user, appUser, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
