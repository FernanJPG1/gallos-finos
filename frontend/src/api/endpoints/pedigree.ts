import apiClient from '../client';
import type { NodoArbol } from '../../types';
import { storageEngine } from '../../services/storageEngine';

export const pedigreeApi = {
  getArbol: async (aveId: string, generaciones: number = 3): Promise<NodoArbol> => {
    try {
      const r = await apiClient.get(`/pedigree/${aveId}/arbol`, { params: { generaciones } });
      return r.data as NodoArbol;
    } catch {
      const arbol = storageEngine.getArbolGenealogico(aveId, generaciones);
      if (!arbol) throw new Error('Árbol no encontrado');
      return arbol;
    }
  },

  calcularCOI: async (aveId: string) => {
    try {
      const r = await apiClient.get(`/pedigree/${aveId}/coi`);
      return r.data;
    } catch {
      return storageEngine.calcularCOI(aveId);
    }
  },

  simularCruce: async (galloId: string, gallinaId: string) => {
    try {
      const r = await apiClient.post('/pedigree/simular-cruce', null, { params: { galloId, gallinaId } });
      return r.data;
    } catch {
      return storageEngine.simularCruce(galloId, gallinaId);
    }
  },
};
