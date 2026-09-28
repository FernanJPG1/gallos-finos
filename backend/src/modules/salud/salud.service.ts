import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface CreateSaludDto {
  aveId?: string; // null = aplica a todo el criadero
  tipo: 'VACUNA' | 'MEDICAMENTO' | 'REVISION' | 'TRATAMIENTO' | 'DESPARASITACION';
  nombre: string;
  fecha: string;
  fechaProxima?: string;
  dosis?: string;
  veterinario?: string;
  observaciones?: string;
}

// Protocolo de vacunación estándar (pre-cargado al crear tenant)
export const PROTOCOLO_VACUNACION = [
  { nombre: 'Newcastle', intervaloDias: 90, dosis: '0.5ml/ave' },
  { nombre: 'Bronquitis Infecciosa', intervaloDias: 120, dosis: '0.5ml/ave' },
  { nombre: 'Marek', intervaloDias: 365, dosis: '0.2ml/ave' },
  { nombre: 'Viruela Aviar', intervaloDias: 180, dosis: '1 pinchazo' },
  { nombre: 'Desparasitación', intervaloDias: 90, dosis: 'Según peso' },
];

@Injectable()
export class SaludService {
  private readonly logger = new Logger(SaludService.name);

  constructor(private readonly dataSource: DataSource) {}

  async create(schema: string, dto: CreateSaludDto) {
    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".salud_registros
        (ave_id, tipo, nombre, fecha, fecha_proxima, dosis, veterinario, observaciones)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [
        dto.aveId || null,
        dto.tipo,
        dto.nombre,
        dto.fecha,
        dto.fechaProxima || null,
        dto.dosis || null,
        dto.veterinario || null,
        dto.observaciones || null,
      ],
    );
    return result[0];
  }

  async findAll(schema: string, filters?: { aveId?: string; tipo?: string; mes?: string }) {
    let query = `SELECT s.*, a.nombre as ave_nombre
                 FROM "${schema}".salud_registros s
                 LEFT JOIN "${schema}".aves a ON s.ave_id = a.id
                 WHERE 1=1`;
    const params: any[] = [];
    let i = 1;

    if (filters?.aveId) {
      query += ` AND s.ave_id = $${i++}`;
      params.push(filters.aveId);
    }
    if (filters?.tipo) {
      query += ` AND s.tipo = $${i++}`;
      params.push(filters.tipo);
    }
    if (filters?.mes) {
      // mes formato YYYY-MM
      query += ` AND TO_CHAR(s.fecha, 'YYYY-MM') = $${i++}`;
      params.push(filters.mes);
    }

    query += ` ORDER BY s.fecha DESC`;
    return this.dataSource.query(query, params);
  }

  async getCalendario(schema: string, mes: string) {
    // Devuelve todos los eventos del mes (completados y pendientes)
    const eventos = await this.dataSource.query(
      `SELECT s.*, a.nombre as ave_nombre,
        EXTRACT(DAY FROM s.fecha) as dia
       FROM "${schema}".salud_registros s
       LEFT JOIN "${schema}".aves a ON s.ave_id = a.id
       WHERE TO_CHAR(s.fecha, 'YYYY-MM') = $1
          OR TO_CHAR(s.fecha_proxima, 'YYYY-MM') = $1
       ORDER BY s.fecha`,
      [mes],
    );

    return eventos;
  }

  async marcarCompletado(schema: string, id: string) {
    const result = await this.dataSource.query(
      `UPDATE "${schema}".salud_registros SET completado = TRUE WHERE id = $1 RETURNING *`,
      [id],
    );
    return result[0];
  }

  async getProximos(schema: string, diasAdelante: number = 30) {
    const result = await this.dataSource.query(
      `SELECT s.*, a.nombre as ave_nombre,
        (s.fecha_proxima - CURRENT_DATE) as dias_restantes
       FROM "${schema}".salud_registros s
       LEFT JOIN "${schema}".aves a ON s.ave_id = a.id
       WHERE s.fecha_proxima BETWEEN CURRENT_DATE AND (CURRENT_DATE + $1::INTEGER)
         AND s.completado = FALSE
       ORDER BY s.fecha_proxima`,
      [diasAdelante],
    );
    return result;
  }

  async getVencidos(schema: string) {
    return this.dataSource.query(
      `SELECT s.*, a.nombre as ave_nombre,
        (CURRENT_DATE - s.fecha_proxima) as dias_vencido
       FROM "${schema}".salud_registros s
       LEFT JOIN "${schema}".aves a ON s.ave_id = a.id
       WHERE s.fecha_proxima < CURRENT_DATE AND s.completado = FALSE
       ORDER BY s.fecha_proxima`,
    );
  }

  async initProtocolo(schema: string) {
    const hoy = new Date();
    for (const vacuna of PROTOCOLO_VACUNACION) {
      const proxima = new Date(hoy);
      proxima.setDate(proxima.getDate() + vacuna.intervaloDias);

      await this.dataSource.query(
        `INSERT INTO "${schema}".salud_registros (tipo, nombre, fecha, fecha_proxima, dosis)
         VALUES ('VACUNA', $1, $2, $3, $4)
         ON CONFLICT DO NOTHING`,
        [vacuna.nombre, hoy.toISOString().split('T')[0], proxima.toISOString().split('T')[0], vacuna.dosis],
      );
    }

    return { message: 'Protocolo de vacunación iniciado correctamente' };
  }
}
