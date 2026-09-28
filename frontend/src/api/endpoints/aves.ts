import apiClient from '../client';
import type { Ave, FiltrosAves } from '../../types';
import { storageEngine } from '../../services/storageEngine';

export const avesApi = {
  getAll: async (filters?: FiltrosAves): Promise<Ave[]> => {
    try {
      const r = await apiClient.get('/aves', { params: filters });
      return r.data as Ave[];
    } catch {
      return storageEngine.getAves(filters);
    }
  },

  getOne: async (id: string): Promise<Ave> => {
    try {
      const r = await apiClient.get(`/aves/${id}`);
      return r.data as Ave;
    } catch {
      const ave = storageEngine.getAve(id);
      if (!ave) throw new Error('Ave no encontrada');
      return ave;
    }
  },

  create: async (data: Partial<Ave>): Promise<Ave> => {
    try {
      const r = await apiClient.post('/aves', data);
      return r.data as Ave;
    } catch {
      return storageEngine.createAve(data);
    }
  },

  update: async (id: string, data: Partial<Ave>): Promise<Ave> => {
    try {
      const r = await apiClient.put(`/aves/${id}`, data);
      return r.data as Ave;
    } catch {
      return storageEngine.updateAve(id, data);
    }
  },

  updateEstado: async (id: string, estado: string): Promise<Ave> => {
    try {
      const r = await apiClient.patch(`/aves/${id}/estado`, { estado });
      return r.data as Ave;
    } catch {
      return storageEngine.updateAve(id, { estado: estado as any });
    }
  },

  getEvaluacionesFisicas: async (id: string) => {
    try {
      const r = await apiClient.get(`/aves/${id}/evaluaciones/fisicas`);
      return r.data;
    } catch {
      return [];
    }
  },

  addEvaluacionFisica: async (id: string, data: any) => {
    try {
      const r = await apiClient.post(`/aves/${id}/evaluaciones/fisicas`, data);
      return r.data;
    } catch {
      return data;
    }
  },

  addEvaluacionTemperamento: async (id: string, data: any) => {
    try {
      const r = await apiClient.post(`/aves/${id}/evaluaciones/temperamento`, data);
      return r.data;
    } catch {
      return data;
    }
  },
};
