import apiClient from '../client';
import type { Pelea, FiltrosPeleas } from '../../types';
import { storageEngine } from '../../services/storageEngine';

export const peleasApi = {
  getAll: async (filters?: FiltrosPeleas): Promise<Pelea[]> => {
    try {
      const r = await apiClient.get('/peleas', { params: filters });
      return r.data as Pelea[];
    } catch {
      return storageEngine.getPeleas(filters?.galloId);
    }
  },

  getByAve: async (galloId: string): Promise<Pelea[]> => {
    try {
      const r = await apiClient.get(`/peleas/gallo/${galloId}`);
      return r.data as Pelea[];
    } catch {
      return storageEngine.getPeleas(galloId);
    }
  },

  getEstadisticas: async (galloId: string) => {
    try {
      const r = await apiClient.get(`/peleas/gallo/${galloId}/estadisticas`);
      return r.data;
    } catch {
      const ave = storageEngine.getAve(galloId);
      const peleas = storageEngine.getPeleas(galloId);
      return {
        total: peleas.length,
        victorias: ave?.victorias || 0,
        derrotas: ave?.derrotas || 0,
        empates: ave?.empates || 0,
      };
    }
  },

  create: async (data: Partial<Pelea>): Promise<Pelea> => {
    try {
      const r = await apiClient.post('/peleas', data);
      return r.data as Pelea;
    } catch {
      return storageEngine.createPelea(data);
    }
  },
};
