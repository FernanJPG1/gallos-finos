import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface SgtResult {
  aveId: string;
  sgt: number;
  d1_linaje: number;
  d2_rendimiento: number;
  d3_fisico: number;
  d4_temperamento: number;
  d5_salud: number;
  breakdown: {
    d1_detalle: Record<string, number>;
    d2_detalle: Record<string, number>;
    d3_detalle: Record<string, number>;
    d4_detalle: Record<string, number>;
    d5_detalle: Record<string, number>;
  };
}

@Injectable()
export class SgtService {
  private readonly logger = new Logger(SgtService.name);

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Calcula el SGT (Score Genético Total) para un ave.
   *
   * Pesos por dimensión:
   * D1 Linaje/Pedigree  30%
   * D2 Rendimiento      25%
   * D3 Físico           25%
   * D4 Temperamento     10%
   * D5 Salud            10%
   *
   * Escala: 1.00 – 10.00
   */
  async calcularSgt(schema: string, aveId: string): Promise<SgtResult> {
    const ave = await this.getAveData(schema, aveId);
    if (!ave) throw new NotFoundException(`Ave '${aveId}' no encontrada`);

    const d1 = await this.calcularD1Linaje(schema, ave);
    const d2 = await this.calcularD2Rendimiento(schema, ave);
    const d3 = await this.calcularD3Fisico(schema, ave);
    const d4 = await this.calcularD4Temperamento(schema, ave);
    const d5 = await this.calcularD5Salud(schema, ave);

    const sgt = this.clamp(
      d1.score * 0.30 +
      d2.score * 0.25 +
      d3.score * 0.25 +
      d4.score * 0.10 +
      d5.score * 0.10,
      1, 10,
    );

    const result: SgtResult = {
      aveId,
      sgt: Math.round(sgt * 100) / 100,
      d1_linaje: Math.round(d1.score * 100) / 100,
      d2_rendimiento: Math.round(d2.score * 100) / 100,
      d3_fisico: Math.round(d3.score * 100) / 100,
      d4_temperamento: Math.round(d4.score * 100) / 100,
      d5_salud: Math.round(d5.score * 100) / 100,
      breakdown: {
        d1_detalle: d1.detalle,
        d2_detalle: d2.detalle,
        d3_detalle: d3.detalle,
        d4_detalle: d4.detalle,
        d5_detalle: d5.detalle,
      },
    };

    // Persistir en historial y actualizar ave
    await this.persistirSgt(schema, aveId, result);

    return result;
  }

  /**
   * D1 - Linaje/Pedigree (30%)
   * pureza*0.40 + profundidad*0.30 + calidad_ancestros*0.30
   */
  private async calcularD1Linaje(schema: string, ave: any) {
    // Pureza: ¿tiene padre Y madre registrados?
    const tienePadre = !!ave.padre_id;
    const tieneMadre = !!ave.madre_id;
    const pureza = tienePadre && tieneMadre ? 8.0 : tienePadre || tieneMadre ? 5.0 : 2.0;

    // Profundidad: buscar abuelos
    let generaciones = 0;
    if (tienePadre || tieneMadre) {
      generaciones = 1;
      const abuelos = await this.contarAncestros(schema, ave.id, 2);
      if (abuelos >= 2) generaciones = 2;
      const bisabuelos = await this.contarAncestros(schema, ave.id, 3);
      if (bisabuelos >= 2) generaciones = 3;
      const tatara = await this.contarAncestros(schema, ave.id, 4);
      if (tatara >= 2) generaciones = 4;
    }
    const profundidad = Math.min(generaciones * 2.0 + 1.0, 10.0);

    // Calidad ancestros: promedio SGT de padres si lo tienen
    let calidadAncestros = 5.0;
    if (tienePadre || tieneMadre) {
      const ancestroIds = [ave.padre_id, ave.madre_id].filter(Boolean);
      const sgtAncestros = await this.dataSource.query(
        `SELECT AVG(sgt_score) as avg_sgt FROM "${schema}".aves WHERE id = ANY($1) AND sgt_score IS NOT NULL`,
        [ancestroIds],
      );
      if (sgtAncestros[0]?.avg_sgt) {
        calidadAncestros = parseFloat(sgtAncestros[0].avg_sgt);
      }
    }

    const score = this.clamp(
      pureza * 0.40 + profundidad * 0.30 + calidadAncestros * 0.30,
      1, 10,
    );

    return {
      score,
      detalle: { pureza, profundidad, calidadAncestros },
    };
  }

  /**
   * D2 - Rendimiento en pelea (25%)
   * pct_vic*0.40 + tasa_superv*0.25 + racha*0.20 + peso_modal*0.15
   */
  private async calcularD2Rendimiento(schema: string, ave: any) {
    const peleas = await this.dataSource.query(
      `SELECT resultado FROM "${schema}".peleas WHERE gallo_id = $1`,
      [ave.id],
    );

    if (!peleas.length) {
      // Sin historial: score neutro 5.0
      return { score: 5.0, detalle: { victorias: 0, total: 0, pct_vic: 0, racha: 0 } };
    }

    const total = peleas.length;
    const victorias = peleas.filter(p => p.resultado === 'VICTORIA').length;
    const muertes = peleas.filter(p => p.resultado === 'MUERTE').length;
    const pct_vic = victorias / total;
    const tasa_superv = 1 - (muertes / total);

    // Racha actual de victorias
    let racha = 0;
    for (let i = peleas.length - 1; i >= 0; i--) {
      if (peleas[i].resultado === 'VICTORIA') racha++;
      else break;
    }

    const score_pct = pct_vic * 10;
    const score_superv = tasa_superv * 10;
    const score_racha = Math.min(racha * 1.5, 10);
    const peso_modal = 7.0; // placeholder hasta tener histórico de peso en pelea

    const score = this.clamp(
      score_pct * 0.40 + score_superv * 0.25 + score_racha * 0.20 + peso_modal * 0.15,
      1, 10,
    );

    return {
      score,
      detalle: {
        victorias,
        total,
        pct_vic: Math.round(pct_vic * 100),
        tasa_superv: Math.round(tasa_superv * 100),
        racha,
      },
    };
  }

  /**
   * D3 - Físico (25%)
   * conformacion*0.25 + score_patas*0.25 + score_espuela*0.30 + norm_peso*0.20
   */
  private async calcularD3Fisico(schema: string, ave: any) {
    const evalFisica = await this.dataSource.query(
      `SELECT * FROM "${schema}".evaluaciones_fisicas WHERE ave_id = $1 ORDER BY fecha DESC LIMIT 1`,
      [ave.id],
    );

    if (!evalFisica.length) {
      return { score: 5.0, detalle: { sin_evaluacion: true } };
    }

    const ef = evalFisica[0];
    const conformacion = parseFloat(ef.conformacion) || 5.0;
    const scorePatas = parseFloat(ef.score_patas) || 5.0;
    const scoreEspuela = parseFloat(ef.score_espuela) || 5.0;

    // Normalizar peso: rango ideal 1800–2400g → 10, fuera de rango baja
    const peso = parseFloat(ef.peso_gramos) || (ave.peso_gramos || 2000);
    let normPeso: number;
    if (peso >= 1800 && peso <= 2400) normPeso = 9.0;
    else if (peso < 1600 || peso > 2800) normPeso = 4.0;
    else normPeso = 6.5;

    const score = this.clamp(
      conformacion * 0.25 + scorePatas * 0.25 + scoreEspuela * 0.30 + normPeso * 0.20,
      1, 10,
    );

    return {
      score,
      detalle: { conformacion, scorePatas, scoreEspuela, normPeso, peso },
    };
  }

  /**
   * D4 - Temperamento (10%)
   * coraje*0.30 + agresividad*0.25 + inteligencia*0.25 + recuperacion*0.20
   */
  private async calcularD4Temperamento(schema: string, ave: any) {
    const evalTemp = await this.dataSource.query(
      `SELECT * FROM "${schema}".evaluaciones_temperamento WHERE ave_id = $1 ORDER BY fecha DESC LIMIT 1`,
      [ave.id],
    );

    if (!evalTemp.length) {
      return { score: 5.0, detalle: { sin_evaluacion: true } };
    }

    const et = evalTemp[0];
    const coraje = parseFloat(et.coraje) || 5.0;
    const agresividad = parseFloat(et.agresividad) || 5.0;
    const inteligencia = parseFloat(et.inteligencia) || 5.0;
    const recuperacion = parseFloat(et.recuperacion) || 5.0;

    const score = this.clamp(
      coraje * 0.30 + agresividad * 0.25 + inteligencia * 0.25 + recuperacion * 0.20,
      1, 10,
    );

    return {
      score,
      detalle: { coraje, agresividad, inteligencia, recuperacion },
    };
  }

  /**
   * D5 - Salud (10%)
   * score_vacunas*0.40 + score_enfermedad*0.40 + score_base*0.20
   */
  private async calcularD5Salud(schema: string, ave: any) {
    const hoy = new Date();

    // Vacunas vencidas (próxima_fecha < hoy)
    const vacunasVencidas = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM "${schema}".salud_registros
       WHERE ave_id = $1 AND tipo = 'VACUNA' AND fecha_proxima < $2 AND completado = FALSE`,
      [ave.id, hoy],
    );
    const nVencidas = parseInt(vacunasVencidas[0].total);
    const scoreVacunas = Math.max(10 - nVencidas * 2, 1);

    // Enfermedades activas
    const enfermedadesActivas = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM "${schema}".salud_registros
       WHERE ave_id = $1 AND tipo = 'TRATAMIENTO' AND completado = FALSE`,
      [ave.id],
    );
    const nEnfermedades = parseInt(enfermedadesActivas[0].total);
    const scoreEnfermedad = Math.max(10 - nEnfermedades * 3, 1);

    const scoreBase = 8.0; // Score base de salud si no hay registros

    const score = this.clamp(
      scoreVacunas * 0.40 + scoreEnfermedad * 0.40 + scoreBase * 0.20,
      1, 10,
    );

    return {
      score,
      detalle: { vacunasVencidas: nVencidas, enfermedadesActivas: nEnfermedades, scoreBase },
    };
  }

  /**
   * Recomendaciones para un evento: gallos próximos y listos para pelear.
   * Filtra por: peso ±5%, semanas de descanso ≥2, estado ACTIVO.
   */
  async getRecomendaciones(
    schema: string,
    pesoEventoGramos: number,
    fechaEvento: string,
  ) {
    const aves = await this.dataSource.query(
      `SELECT a.*,
        (SELECT MAX(p.fecha) FROM "${schema}".peleas p WHERE p.gallo_id = a.id) as ultima_pelea,
        EXTRACT(WEEK FROM (NOW() - (SELECT MAX(p.fecha) FROM "${schema}".peleas p WHERE p.gallo_id = a.id))) as semanas_descanso
       FROM "${schema}".aves a
       WHERE a.tipo = 'GALLO'
         AND a.estado = 'ACTIVO'
         AND a.peso_gramos BETWEEN $1 AND $2
         AND a.sgt_score IS NOT NULL
       ORDER BY a.sgt_score DESC`,
      [
        Math.round(pesoEventoGramos * 0.95),
        Math.round(pesoEventoGramos * 1.05),
      ],
    );

    return aves.map(ave => {
      const semanas = ave.semanas_descanso ? parseFloat(ave.semanas_descanso) : 999;
      const listo = semanas >= 2 || !ave.ultima_pelea;
      return {
        ...ave,
        semanas_descanso: Math.floor(semanas),
        listo_para_pelea: listo,
        advertencia: !listo ? 'Poco descanso desde última pelea' : null,
      };
    });
  }

  async calcularTodos(schema: string): Promise<SgtResult[]> {
    const aves = await this.dataSource.query(
      `SELECT id FROM "${schema}".aves WHERE estado = 'ACTIVO'`,
    );
    const results: SgtResult[] = [];
    for (const ave of aves) {
      try {
        const result = await this.calcularSgt(schema, ave.id);
        results.push(result);
      } catch (e) {
        this.logger.warn(`Error calculando SGT para ${ave.id}: ${e.message}`);
      }
    }
    return results;
  }

  private async getAveData(schema: string, aveId: string) {
    const result = await this.dataSource.query(
      `SELECT * FROM "${schema}".aves WHERE id = $1`,
      [aveId],
    );
    return result[0] || null;
  }

  private async contarAncestros(schema: string, aveId: string, nivel: number): Promise<number> {
    // Recursivo simple hasta nivel N
    if (nivel === 0) return 1;
    const ave = await this.getAveData(schema, aveId);
    if (!ave) return 0;
    let count = 0;
    if (ave.padre_id) count += await this.contarAncestros(schema, ave.padre_id, nivel - 1);
    if (ave.madre_id) count += await this.contarAncestros(schema, ave.madre_id, nivel - 1);
    return count;
  }

  private async persistirSgt(schema: string, aveId: string, result: SgtResult) {
    await this.dataSource.query(
      `INSERT INTO "${schema}".sgt_scores (ave_id, sgt, d1_linaje, d2_rendimiento, d3_fisico, d4_temperamento, d5_salud)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [aveId, result.sgt, result.d1_linaje, result.d2_rendimiento, result.d3_fisico, result.d4_temperamento, result.d5_salud],
    );

    await this.dataSource.query(
      `UPDATE "${schema}".aves SET sgt_score = $1, updated_at = NOW() WHERE id = $2`,
      [result.sgt, aveId],
    );
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}
