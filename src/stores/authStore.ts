import { create } from 'zustand';
import { config } from '../config';
import { syncStorage, storageUtils } from '../utils/storage';
import { apiService } from '../services';
import { UserInfo, LoginRequest, RegisterRequest } from '../types';

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (data: LoginRequest) => Promise<boolean>;
  register: (data: RegisterRequest) => Promise<boolean>;
  logout: () => void;
  loadStoredAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.login(data);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        syncStorage.setString(config.storage.accessTokenKey, accessToken);
        syncStorage.setString(config.storage.refreshTokenKey, refreshToken);
        await storageUtils.setObject(config.storage.userKey, user);
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: response.error?.message || 'Login failed', isLoading: false });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Login failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.register(data);
      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;
        syncStorage.setString(config.storage.accessTokenKey, accessToken);
        syncStorage.setString(config.storage.refreshTokenKey, refreshToken);
        await storageUtils.setObject(config.storage.userKey, user);
        set({ user, isAuthenticated: true, isLoading: false });
        return true;
      } else {
        set({ error: response.error?.message || 'Registration failed', isLoading: false });
        return false;
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      set({ error: message, isLoading: false });
      return false;
    }
  },

  logout: () => {
    syncStorage.remove(config.storage.accessTokenKey);
    syncStorage.remove(config.storage.refreshTokenKey);
    storageUtils.remove(config.storage.userKey);
    set({ user: null, isAuthenticated: false, error: null });
  },

  loadStoredAuth: async () => {
    await syncStorage.loadCache();
    const token = syncStorage.getString(config.storage.accessTokenKey);
    const user = await storageUtils.getObject<UserInfo>(config.storage.userKey);
    if (token && user) {
      set({ user, isAuthenticated: true });
    }
  },

  clearError: () => set({ error: null }),
}));
