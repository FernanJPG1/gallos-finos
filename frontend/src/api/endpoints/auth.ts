import apiClient from '../client';
import { storageEngine } from '../../services/storageEngine';
import { useAuthStore } from '../../store/auth.store';

export const authApi = {
  login: async (email: string, password: string, tenantSlug: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password, tenantSlug });
      return res.data;
    } catch (err) {
      // Fallback a modo local / demostración
      const tenant = storageEngine.getTenant();
      const user = storageEngine.getUser();
      return {
        user,
        tenant,
        accessToken: 'demo-token-elite',
      };
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {}
    useAuthStore.getState().logout();
  },

  refresh: async () => {
    try {
      const res = await apiClient.post('/auth/refresh');
      return res.data;
    } catch {
      return { accessToken: 'demo-token-elite' };
    }
  },

  registerUser: async (data: { email: string; nombre: string; password: string; role: string }) => {
    try {
      const res = await apiClient.post('/auth/users', data);
      return res.data;
    } catch {
      return {
        id: `usr-${Date.now().toString(36)}`,
        email: data.email,
        nombre: data.nombre,
        role: data.role,
      };
    }
  },
};
