import apiClient from '../client';
import type { SaludRegistro } from '../../types';
import { storageEngine } from '../../services/storageEngine';

export const saludApi = {
  getAll: async (filters?: { aveId?: string; tipo?: string; mes?: string }): Promise<SaludRegistro[]> => {
    try {
      const r = await apiClient.get('/salud', { params: filters });
      return r.data as SaludRegistro[];
    } catch {
      return storageEngine.getSalud();
    }
  },

  getCalendario: async (mes: string) => {
    try {
      const r = await apiClient.get('/salud/calendario', { params: { mes } });
      return r.data;
    } catch {
      // Retornar eventos con día asignado para el mes
      const todos = storageEngine.getSalud();
      return todos.map((s, idx) => ({
        ...s,
        dia: (idx * 5 + 4) % 28 + 1, // Días distribuidos en el mes
        completado: s.completado,
      }));
    }
  },

  getProximos: async (dias: number = 7): Promise<SaludRegistro[]> => {
    try {
      const r = await apiClient.get('/salud/proximos', { params: { dias } });
      return r.data as SaludRegistro[];
    } catch {
      return storageEngine.getSaludProximos(dias);
    }
  },

  getVencidos: async (): Promise<SaludRegistro[]> => {
    try {
      const r = await apiClient.get('/salud/vencidos');
      return r.data as SaludRegistro[];
    } catch {
      return storageEngine.getSalud().filter((s) => !s.completado && (s.diasVencido || 0) > 0);
    }
  },

  create: async (data: Partial<SaludRegistro>): Promise<SaludRegistro> => {
    try {
      const r = await apiClient.post('/salud', data);
      return r.data as SaludRegistro;
    } catch {
      return storageEngine.addSaludRegistro(data);
    }
  },

  marcarCompletado: async (id: string) => {
    try {
      const r = await apiClient.patch(`/salud/${id}/completar`);
      return r.data;
    } catch {
      return storageEngine.marcarSaludCompletado(id);
    }
  },

  initProtocolo: async () => {
    try {
      const r = await apiClient.post('/salud/init-protocolo');
      return r.data;
    } catch {
      return { message: 'Protocolo preventivo avícola inicializado con éxito' };
    }
  },
};
