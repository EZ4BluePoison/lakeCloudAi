import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, PermissionCode } from '@/types';
import * as authService from '@/services/authService';

interface AuthState {
  user: User | null;
  roles: string[];
  permissions: PermissionCode[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setPermissions: (permissions: PermissionCode[]) => void;
  setRoles: (roles: string[]) => void;
  setToken: (token: string | null) => void;
  loginWithCode: (code: string) => Promise<void>;
  loginWithToken: (
    token: string,
    result?: { user: User; roles: string[]; permissions: PermissionCode[] }
  ) => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  logout: () => void;
  hasPermission: (code: PermissionCode | PermissionCode[]) => boolean;
  hasRole: (role: string) => boolean;
  clearError: () => void;
}

const initialState: AuthState = {
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

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      setPermissions: (permissions) => {
        set({ permissions });
      },

      setRoles: (roles) => {
        set({ roles });
      },

      setToken: (token) => {
        authService.setApiToken(token);
        if (!token) {
          set({ ...initialState });
        }
      },

      loginWithCode: async (code) => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.exchangeCode({ code });
          set({
            user: result.user,
            roles: result.roles || [],
            permissions: result.permissions || [],
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : '登录失败',
          });
          throw err;
        }
      },

      loginWithToken: async (token, result) => {
        set({ isLoading: true, error: null });
        try {
          authService.setApiToken(token);
          if (result) {
            set({
              user: result.user,
              roles: result.roles || [],
              permissions: result.permissions || [],
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
          await get().fetchCurrentUser();
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Token 登录失败',
          });
          throw err;
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await authService.getCurrentUser();
          set({
            user: result.user,
            roles: result.roles || [],
            permissions: result.permissions || [],
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const current = get();
          // 后端不可用时，如果本地已有登录态，则保持现有用户/权限，避免刷新后变成管理员
          if (current.isAuthenticated && current.user && authService.getApiToken()) {
            set({ isLoading: false, error: null });
            return;
          }
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : '获取用户信息失败',
          });
          throw err;
        }
      },

      logout: () => {
        authService.logout();
        set({ ...initialState });
      },

      hasPermission: (code) => {
        const { permissions, roles } = get();
        if (roles.includes('admin')) return true;
        const codes = Array.isArray(code) ? code : [code];
        return codes.some((c) => permissions.includes(c));
      },

      hasRole: (role) => {
        return get().roles.includes(role);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
