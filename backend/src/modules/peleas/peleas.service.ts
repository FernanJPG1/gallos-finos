import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface CreatePeleaDto {
  galloId: string;
  eventoNombre?: string;
  fecha: string;
  lugar?: string;
  pesoGramos?: number;
  rivalNombre?: string;
  rivalCriadero?: string;
  resultado: 'VICTORIA' | 'DERROTA' | 'EMPATE' | 'MUERTE';
  duracionMinutos?: number;
  lesiones?: string;
  notas?: string;
}

@Injectable()
export class PeleasService {
  private readonly logger = new Logger(PeleasService.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(schema: string, dto: CreatePeleaDto, userId: string) {
    // Verificar que el gallo existe y está activo
    const gallo = await this.dataSource.query(
      `SELECT id, nombre, estado FROM "${schema}".aves WHERE id = $1 AND tipo = 'GALLO'`,
      [dto.galloId],
    );

    if (!gallo.length) {
      throw new NotFoundException(`Gallo '${dto.galloId}' no encontrado`);
    }

    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".peleas
        (gallo_id, evento, fecha, lugar, peso_pelea_gramos, rival_nombre, rival_criadero,
         resultado, duracion_minutos, lesiones, notas, registrado_por)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [
        dto.galloId,
        dto.eventoNombre || null,
        dto.fecha,
        dto.lugar || null,
        dto.pesoGramos || null,
        dto.rivalNombre || null,
        dto.rivalCriadero || null,
        dto.resultado,
        dto.duracionMinutos || null,
        dto.lesiones || null,
        dto.notas || null,
        userId,
      ],
    );

    // Si murió, actualizar estado del gallo
    if (dto.resultado === 'MUERTE') {
      await this.dataSource.query(
        `UPDATE "${schema}".aves SET estado = 'MUERTO', updated_at = NOW() WHERE id = $1`,
        [dto.galloId],
      );
      this.logger.log(`Gallo ${dto.galloId} marcado como MUERTO`);
    }

    return result[0];
  }

  async findByAve(schema: string, galloId: string) {
    return this.dataSource.query(
      `SELECT * FROM "${schema}".peleas WHERE gallo_id = $1 ORDER BY fecha DESC`,
      [galloId],
    );
  }

  async findAll(schema: string, filters?: { galloId?: string; resultado?: string; fechaDesde?: string }) {
    let query = `SELECT p.*, a.nombre as gallo_nombre FROM "${schema}".peleas p
                 JOIN "${schema}".aves a ON p.gallo_id = a.id WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    if (filters?.galloId) {
      query += ` AND p.gallo_id = $${i++}`;
      params.push(filters.galloId);
    }
    if (filters?.resultado) {
      query += ` AND p.resultado = $${i++}`;
      params.push(filters.resultado);
    }
    if (filters?.fechaDesde) {
      query += ` AND p.fecha >= $${i++}`;
      params.push(filters.fechaDesde);
    }

    query += ` ORDER BY p.fecha DESC`;
    return this.dataSource.query(query, params);
  }

  async getEstadisticas(schema: string, galloId: string) {
    const stats = await this.dataSource.query(
      `SELECT
        COUNT(*) as total_peleas,
        COUNT(CASE WHEN resultado = 'VICTORIA' THEN 1 END) as victorias,
        COUNT(CASE WHEN resultado = 'DERROTA' THEN 1 END) as derrotas,
        COUNT(CASE WHEN resultado = 'EMPATE' THEN 1 END) as empates,
        COUNT(CASE WHEN resultado = 'MUERTE' THEN 1 END) as muertes,
        ROUND(COUNT(CASE WHEN resultado = 'VICTORIA' THEN 1 END) * 100.0 / NULLIF(COUNT(*), 0), 1) as pct_victorias,
        MAX(fecha) as ultima_pelea
       FROM "${schema}".peleas WHERE gallo_id = $1`,
      [galloId],
    );

    // Racha actual
    const historico = await this.dataSource.query(
      `SELECT resultado FROM "${schema}".peleas WHERE gallo_id = $1 ORDER BY fecha DESC`,
      [galloId],
    );

    let rachaActual = 0;
    for (const p of historico) {
      if (p.resultado === 'VICTORIA') rachaActual++;
      else break;
    }

    return { ...stats[0], racha_actual: rachaActual };
  }
}
