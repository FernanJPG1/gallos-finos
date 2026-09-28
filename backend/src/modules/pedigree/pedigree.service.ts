import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface NodoArbol {
  id: string;
  nombre: string;
  tipo: string;
  linea_genetica?: string;
  sgt_score?: number;
  padre?: NodoArbol;
  madre?: NodoArbol;
}

@Injectable()
export class PedigreeService {
  private readonly logger = new Logger(PedigreeService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Construye el árbol genealógico de un ave hasta N generaciones.
   * Por defecto: 4 generaciones.
   */
  async getArbol(schema: string, aveId: string, generaciones: number = 4): Promise<NodoArbol> {
    const ave = await this.getAve(schema, aveId);
    if (!ave) throw new NotFoundException(`Ave '${aveId}' no encontrada`);

    return this.construirNodo(schema, ave, generaciones);
  }

  private async construirNodo(schema: string, ave: any, generacionesRestantes: number): Promise<NodoArbol> {
    const nodo: NodoArbol = {
      id: ave.id,
      nombre: ave.nombre,
      tipo: ave.tipo,
      linea_genetica: ave.linea_genetica,
      sgt_score: ave.sgt_score ? parseFloat(ave.sgt_score) : undefined,
    };

    if (generacionesRestantes > 0) {
      if (ave.padre_id) {
        const padre = await this.getAve(schema, ave.padre_id);
        if (padre) {
          nodo.padre = await this.construirNodo(schema, padre, generacionesRestantes - 1);
        }
      }
      if (ave.madre_id) {
        const madre = await this.getAve(schema, ave.madre_id);
        if (madre) {
          nodo.madre = await this.construirNodo(schema, madre, generacionesRestantes - 1);
        }
      }
    }

    return nodo;
  }

  /**
   * Calcula el Coeficiente de Endogamia (COI) usando la fórmula de Wright.
   *
   * F(I) = Σ [(0.5)^(n1+n2+1) * (1 + FA)]
   * donde:
   * - n1 = generaciones entre padre del individuo y ancestro común
   * - n2 = generaciones entre madre del individuo y ancestro común
   * - FA = COI del ancestro común
   */
  async calcularCOI(schema: string, aveId: string): Promise<{ coi: number; nivel: string; ancestrosComunes: number }> {
    const ave = await this.getAve(schema, aveId);
    if (!ave) throw new NotFoundException(`Ave '${aveId}' no encontrada`);

    if (!ave.padre_id || !ave.madre_id) {
      return { coi: 0, nivel: 'Sin datos', ancestrosComunes: 0 };
    }

    const ancestrosPadre = await this.obtenerAncestros(schema, ave.padre_id, 4, 0);
    const ancestrosMadre = await this.obtenerAncestros(schema, ave.madre_id, 4, 0);

    let coi = 0;
    let ancestrosComunes = 0;

    // Encontrar ancestros comunes
    for (const [ancestroId, nivelesPaternos] of ancestrosPadre.entries()) {
      if (ancestrosMadre.has(ancestroId)) {
        const nivelesMaternos = ancestrosMadre.get(ancestroId);
        ancestrosComunes++;

        // Para cada combinación de caminos paterno y materno
        for (const n1 of nivelesPaternos) {
          for (const n2 of nivelesMaternos) {
            const fa = 0; // COI del ancestro (simplificado; se puede extender recursivamente)
            coi += Math.pow(0.5, n1 + n2 + 1) * (1 + fa);
          }
        }
      }
    }

    coi = Math.min(coi, 1); // No puede superar 100%

    const nivel = coi === 0
      ? 'Sin endogamia'
      : coi < 0.0625
      ? 'Bajo'
      : coi < 0.125
      ? 'Moderado'
      : coi < 0.25
      ? 'Alto'
      : 'Muy Alto';

    // Actualizar COI en la tabla aves
    await this.dataSource.query(
      `UPDATE "${schema}".aves SET coi = $1 WHERE id = $2`,
      [coi, aveId],
    );

    return {
      coi: Math.round(coi * 10000) / 100, // como porcentaje con 2 decimales
      nivel,
      ancestrosComunes,
    };
  }

  /**
   * Obtiene ancestros de un ave en un mapa id -> [niveles donde aparece]
   */
  private async obtenerAncestros(
    schema: string,
    aveId: string,
    generacionesMax: number,
    nivelActual: number,
  ): Promise<Map<string, number[]>> {
    const mapa = new Map<string, number[]>();

    if (nivelActual > generacionesMax) return mapa;

    const ave = await this.getAve(schema, aveId);
    if (!ave) return mapa;

    // Registrar este ave como ancestro
    if (!mapa.has(aveId)) {
      mapa.set(aveId, []);
    }
    mapa.get(aveId).push(nivelActual);

    // Recursión por padre y madre
    if (ave.padre_id) {
      const ancestrosPadre = await this.obtenerAncestros(schema, ave.padre_id, generacionesMax, nivelActual + 1);
      this.mergeMapa(mapa, ancestrosPadre);
    }
    if (ave.madre_id) {
      const ancestrosMadre = await this.obtenerAncestros(schema, ave.madre_id, generacionesMax, nivelActual + 1);
      this.mergeMapa(mapa, ancestrosMadre);
    }

    return mapa;
  }

  private mergeMapa(destino: Map<string, number[]>, origen: Map<string, number[]>) {
    for (const [id, niveles] of origen.entries()) {
      if (!destino.has(id)) {
        destino.set(id, []);
      }
      destino.get(id).push(...niveles);
    }
  }

  /**
   * Sugiere cruce: calcula COI estimado de posible descendiente
   */
  async simularCruce(schema: string, galloId: string, gallinaId: string) {
    const gallo = await this.getAve(schema, galloId);
    const gallina = await this.getAve(schema, gallinaId);

    if (!gallo) throw new NotFoundException(`Gallo '${galloId}' no encontrado`);
    if (!gallina) throw new NotFoundException(`Gallina '${gallinaId}' no encontrada`);

    // Simular COI del posible descendiente
    const ancestrosGallo = await this.obtenerAncestros(schema, galloId, 4, 0);
    const ancestrosGallina = await this.obtenerAncestros(schema, gallinaId, 4, 0);

    let coiEstimado = 0;
    let ancestrosComunes = 0;

    for (const [ancestroId, nivelesGallo] of ancestrosGallo.entries()) {
      if (ancestrosGallina.has(ancestroId)) {
        const nivelesGallina = ancestrosGallina.get(ancestroId);
        ancestrosComunes++;
        for (const n1 of nivelesGallo) {
          for (const n2 of nivelesGallina) {
            coiEstimado += Math.pow(0.5, n1 + n2 + 1);
          }
        }
      }
    }

    coiEstimado = Math.min(coiEstimado, 1);
    const porcentaje = Math.round(coiEstimado * 10000) / 100;

    const recomendacion = porcentaje > 12.5
      ? 'No recomendado: COI estimado muy alto. Considera un gallo sin parentesco.'
      : porcentaje > 6.25
      ? 'Cruce con endogamia moderada. Evaluar con cuidado.'
      : 'Cruce recomendado: bajo COI estimado.';

    return {
      galloId,
      galloNombre: gallo.nombre,
      gallinaId,
      gallinaNombre: gallina.nombre,
      coiEstimado: porcentaje,
      ancestrosComunes,
      recomendacion,
    };
  }

  private async getAve(schema: string, aveId: string) {
    const result = await this.dataSource.query(
      `SELECT id, nombre, tipo, linea_genetica, sgt_score, padre_id, madre_id FROM "${schema}".aves WHERE id = $1`,
      [aveId],
    );
    return result[0] || null;
  }
}
