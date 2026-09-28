import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Usuario, Tenant } from '../types';
import { storageEngine } from '../services/storageEngine';
import { INITIAL_TENANT, INITIAL_USER } from '../services/mockData';

interface AuthStore {
  user: Usuario | null;
  tenant: Tenant | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  layoutMode: 'responsive' | 'mobile-preview';

  setAuth: (user: Usuario, tenant: Tenant, token: string, isDemo?: boolean) => void;
  setAccessToken: (token: string) => void;
  loginDemo: () => void;
  toggleLayoutMode: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      tenant: INITIAL_TENANT,
      accessToken: 'demo-token-elite',
      isAuthenticated: true,
      isDemoMode: true,
      layoutMode: 'responsive',

      setAuth: (user, tenant, accessToken, isDemo = false) =>
        set({ user, tenant, accessToken, isAuthenticated: true, isDemoMode: isDemo }),

      setAccessToken: (accessToken) => set({ accessToken }),

      loginDemo: () => {
        const tenant = storageEngine.getTenant();
        const user = storageEngine.getUser();
        set({
          user,
          tenant,
          accessToken: 'demo-token-elite',
          isAuthenticated: true,
          isDemoMode: true,
        });
      },

      toggleLayoutMode: () => {
        const next = get().layoutMode === 'responsive' ? 'mobile-preview' : 'responsive';
        set({ layoutMode: next });
      },

      logout: () =>
        set({ user: null, tenant: null, accessToken: null, isAuthenticated: false, isDemoMode: false }),
    }),
    {
      name: 'gallero-pro-auth-v2',
      partialize: (state) => ({
        user: state.user,
        tenant: state.tenant,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
        isDemoMode: state.isDemoMode,
        layoutMode: state.layoutMode,
      }),
    },
  ),
);
