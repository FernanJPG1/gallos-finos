import apiClient from '../client';
import { storageEngine } from '../../services/storageEngine';

export const certificadosApi = {
  generar: async (aveId: string) => {
    try {
      const r = await apiClient.post(`/certificados/generar/${aveId}`);
      return r.data;
    } catch {
      return storageEngine.generarCertificado(aveId);
    }
  },
};
