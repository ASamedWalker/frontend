import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for auth state
interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: 'rider' | 'driver';
  profileImage?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  isLoading: boolean;

  // Actions
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  setInitialized: (initialized: boolean) => void;
  setLoading: (loading: boolean) => void;
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isLoggedIn: false,
      isInitialized: false,
      isLoading: false,

      // Action implementations
      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      setUser: (user) => set({ user }),

      login: (token, refreshToken, user) => set({
        token,
        refreshToken,
        user,
        isLoggedIn: true,
      }),

      logout: () => set({
        token: null,
        refreshToken: null,
        user: null,
        isLoggedIn: false,
      }),

      setInitialized: (initialized) => set({ isInitialized: initialized }),

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'okada-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);