import { create } from 'zustand';
import {
  UserAccount,
  UserLoginInput,
  UserRegistrationInput,
  BootstrapAdminInput,
} from '@shared/core';
import { api } from '../services/api/apiClient';

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  checkAuth: () => Promise<void>;
  login: (credentials: UserLoginInput) => Promise<boolean>;
  register: (data: UserRegistrationInput) => Promise<boolean>;
  bootstrapAdmin: (data: BootstrapAdminInput) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.getCurrentUser();
      if (data && data.user) {
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials: UserLoginInput) => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.login(credentials);
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.message || 'Invalid username or password',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data: UserRegistrationInput) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.register(data);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.message || 'Registration failed',
        isLoading: false,
      });
      return false;
    }
  },

  bootstrapAdmin: async (data: BootstrapAdminInput) => {
    set({ isLoading: true, error: null });
    try {
      const result = await api.bootstrapAdmin(data);
      set({
        user: result.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      set({
        error: err.message || 'Failed to initialize administrator',
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
