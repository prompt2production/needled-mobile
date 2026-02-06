/**
 * Auth Store
 * Manages authentication state with Zustand and expo-secure-store
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { User, RegisterRequest } from '../types/api';
import * as authApi from '../services/auth';
import { AUTH_TOKEN_KEY, setOnUnauthorized, clearToken } from '../services/api';

// Check if running in Expo Go (push notifications not supported)
const isExpoGo = Constants.appOwnership === 'expo';

// Lazy-load notifications module to avoid Expo Go errors
// (expo-notifications has auto-registration code that fails in Expo Go)
const getNotifications = async () => {
  if (isExpoGo) return null;
  return import('../services/notifications');
};

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  isNewUser: boolean; // True after registration, false after onboarding

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  // Set up the 401 handler to automatically logout
  setOnUnauthorized(() => {
    const state = get();
    if (state.isAuthenticated) {
      set({ user: null, isAuthenticated: false });
    }
  });

  return {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false,
    isNewUser: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const { user, token } = await authApi.login(email, password);

        // Store token securely
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    register: async (data: RegisterRequest) => {
      set({ isLoading: true });
      try {
        const { user, token } = await authApi.register(data);

        // Store token securely
        await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
          isNewUser: true, // Mark as new user to show onboarding
        });
      } catch (error) {
        set({ isLoading: false });
        throw error;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        // Unregister push token and cancel local notifications (best effort)
        // Only attempt if not in Expo Go
        try {
          const notifications = await getNotifications();
          if (notifications) {
            await Promise.all([
              notifications.unregisterPushToken(),
              notifications.cancelAllScheduledNotifications(),
            ]);
          }
        } catch (e) {
          console.warn('Failed to cleanup notifications:', e);
        }

        // Call logout API (best effort - don't fail if network error)
        try {
          await authApi.logout();
        } catch (e) {
          console.warn('Logout API call failed:', e);
        }

        // Clear token from secure storage
        await clearToken();

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      } catch (error) {
        // Always clear state even if something fails
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    },

    checkSession: async () => {
      set({ isLoading: true });
      try {
        // Check if we have a token
        let token: string | null = null;
        try {
          token = await SecureStore.getItemAsync(AUTH_TOKEN_KEY);
        } catch (e) {
          console.warn('Failed to get token from SecureStore:', e);
        }

        if (!token) {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            isInitialized: true,
          });
          return;
        }

        // Validate token with server
        const user = await authApi.getSession();

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        console.warn('Session check failed:', error);
        // Token invalid or expired - clear it
        try {
          await clearToken();
        } catch (e) {
          console.warn('Failed to clear token:', e);
        }
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    },

    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user });
    },

    updateUser: (updates: Partial<User>) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...updates } });
      }
    },

    completeOnboarding: () => {
      set({ isNewUser: false });
    },
  };
});
