import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authService from '@/services/authService';
import type { User } from '@/types';

interface AuthState {
  token: string | null;
  user: User | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setToken: (token: string | null) => void;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  hasPermission: (code: string) => boolean;
  hasRole: (role: string) => boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  roles: [],
  permissions: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setToken: (accessToken) => {
        authService.setAccessToken(accessToken);
        set({ token: accessToken, isAuthenticated: !!accessToken });
      },

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.login({ username, password });
          authService.setAccessToken(result.accessToken);
          set({
            token: result.accessToken,
            user: result.user,
            roles: result.roles,
            permissions: result.permissions,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          set({
            ...initialState,
            isLoading: false,
            error: err instanceof Error ? err.message : '登录失败',
          });
          throw err;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // ignore
        }
        set({ ...initialState });
      },

      fetchCurrentUser: async () => {
        const token = authService.getAccessToken();
        if (!token) {
          set({ ...initialState });
          return;
        }
        set({ isLoading: true });
        try {
          const payload = authService.parseJwt(token);
          if (!payload?.sub) {
            throw new Error('Token 无效');
          }
          const user = await authService.getCurrentUser(payload.sub);
          set({
            token: token,
            user,
            roles: payload.roles || [],
            permissions: payload.permissions || [],
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err) {
          authService.setAccessToken(null);
          set({
            ...initialState,
            isLoading: false,
            error: err instanceof Error ? err.message : '获取用户信息失败',
          });
        }
      },

      hasPermission: (code) => {
        const { roles, permissions } = get();
        if (roles.some((r) => r === 'PLATFORM_ADMIN' || r === 'admin')) return true;
        return permissions.includes(code);
      },

      hasRole: (role) => get().roles.includes(role),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          authService.setAccessToken(state.token);
        }
      },
    }
  )
);
