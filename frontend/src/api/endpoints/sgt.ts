import apiClient from '../client';
import type { SgtResult } from '../../types';
import { storageEngine } from '../../services/storageEngine';

export const sgtApi = {
  calcular: async (aveId: string): Promise<SgtResult> => {
    try {
      const r = await apiClient.post(`/sgt/calcular/${aveId}`);
      return r.data as SgtResult;
    } catch {
      const ave = storageEngine.getAve(aveId);
      const sgt = ave?.sgtScore || 9.2;
      return {
        aveId,
        sgt,
        d1Linaje: 9.8,
        d2Rendimiento: 9.6,
        d3Fisico: 9.5,
        d4Temperamento: 9.2,
        d5Salud: 9.4,
      };
    }
  },

  calcularTodos: async (): Promise<any[]> => {
    try {
      const r = await apiClient.post('/sgt/calcular-todos');
      return r.data;
    } catch {
      return storageEngine.recalcularTodosSgt();
    }
  },

  getRecomendaciones: async (peso: number, fecha: string) => {
    try {
      const r = await apiClient.get('/sgt/recomendaciones', { params: { peso, fecha } });
      return r.data;
    } catch {
      return storageEngine.getRecomendacionesCombate(peso, fecha);
    }
  },
};
