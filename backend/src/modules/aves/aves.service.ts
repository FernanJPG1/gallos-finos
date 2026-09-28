import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateAveDto } from './dto/create-ave.dto';
import { TenantsService } from '../tenants/tenants.service';

@Injectable()
export class AvesService {
  private readonly logger = new Logger(AvesService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly tenantsService: TenantsService,
  ) {}

  async create(schema: string, tenantId: string, dto: CreateAveDto) {
    // Verificar límite del plan
    const tenant = await this.tenantsService.findById(tenantId);
    const countResult = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM "${schema}".aves WHERE estado NOT IN ('MUERTO','VENDIDO')`,
    );
    const currentCount = parseInt(countResult[0].total);

    if (currentCount >= tenant.maxAves) {
      throw new ForbiddenException(
        `Límite de aves alcanzado para el plan ${tenant.plan} (máx. ${tenant.maxAves}). Actualiza tu plan para agregar más aves.`,
      );
    }

    // Verificar ID único
    const existing = await this.dataSource.query(
      `SELECT id FROM "${schema}".aves WHERE id = $1`,
      [dto.id],
    );
    if (existing.length > 0) {
      throw new ConflictException(`Ya existe un ave con ID '${dto.id}'`);
    }

    // Generar QR code
    const qrCode = `GP-${schema}-${dto.id}`;

    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".aves
        (id, nombre, tipo, fecha_nacimiento, origen, linea_genetica, color_plumaje,
         tipo_cresta, color_patas, peso_gramos, talla_cm, longitud_espuela_mm,
         padre_id, madre_id, qr_code, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING *`,
      [
        dto.id,
        dto.nombre,
        dto.tipo,
        dto.fechaNacimiento || null,
        dto.origen || 'PROPIO',
        dto.lineaGenetica || null,
        dto.colorPlumaje || null,
        dto.tipoCresta || null,
        dto.colorPatas || null,
        dto.pesoGramos || null,
        dto.tallaCm || null,
        dto.longitudEspuelaMm || null,
        dto.padreId || null,
        dto.madreId || null,
        qrCode,
        dto.notas || null,
      ],
    );

    this.logger.log(`Ave creada: ${dto.id} - ${dto.nombre} en schema ${schema}`);
    return result[0];
  }

  async findAll(schema: string, filters?: { tipo?: string; estado?: string; search?: string }) {
    let query = `SELECT a.*,
      (SELECT COUNT(*) FROM "${schema}".peleas p WHERE p.gallo_id = a.id AND p.resultado = 'VICTORIA') as victorias,
      (SELECT COUNT(*) FROM "${schema}".peleas p WHERE p.gallo_id = a.id AND p.resultado = 'DERROTA') as derrotas
      FROM "${schema}".aves a WHERE 1=1`;
    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.tipo) {
      query += ` AND a.tipo = $${paramIndex++}`;
      params.push(filters.tipo);
    }
    if (filters?.estado) {
      query += ` AND a.estado = $${paramIndex++}`;
      params.push(filters.estado);
    }
    if (filters?.search) {
      query += ` AND (a.nombre ILIKE $${paramIndex} OR a.id ILIKE $${paramIndex} OR a.linea_genetica ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ` ORDER BY a.sgt_score DESC NULLS LAST, a.nombre`;

    return this.dataSource.query(query, params);
  }

  async findOne(schema: string, id: string) {
    const result = await this.dataSource.query(
      `SELECT a.*,
        p_padre.nombre as padre_nombre,
        p_madre.nombre as madre_nombre,
        (SELECT COUNT(*) FROM "${schema}".peleas p WHERE p.gallo_id = a.id AND p.resultado = 'VICTORIA') as victorias,
        (SELECT COUNT(*) FROM "${schema}".peleas p WHERE p.gallo_id = a.id AND p.resultado = 'DERROTA') as derrotas,
        (SELECT COUNT(*) FROM "${schema}".peleas p WHERE p.gallo_id = a.id AND p.resultado = 'EMPATE') as empates
       FROM "${schema}".aves a
       LEFT JOIN "${schema}".aves p_padre ON a.padre_id = p_padre.id
       LEFT JOIN "${schema}".aves p_madre ON a.madre_id = p_madre.id
       WHERE a.id = $1`,
      [id],
    );

    if (!result.length) {
      throw new NotFoundException(`Ave '${id}' no encontrada`);
    }

    return result[0];
  }

  async update(schema: string, id: string, dto: Partial<CreateAveDto>) {
    await this.findOne(schema, id); // verificar existencia

    const fields: string[] = [];
    const params: any[] = [];
    let i = 1;

    const map: Record<string, string> = {
      nombre: 'nombre',
      lineaGenetica: 'linea_genetica',
      colorPlumaje: 'color_plumaje',
      tipoCresta: 'tipo_cresta',
      colorPatas: 'color_patas',
      pesoGramos: 'peso_gramos',
      tallaCm: 'talla_cm',
      longitudEspuelaMm: 'longitud_espuela_mm',
      notas: 'notas',
    };

    for (const [key, col] of Object.entries(map)) {
      if (dto[key] !== undefined) {
        fields.push(`${col} = $${i++}`);
        params.push(dto[key]);
      }
    }

    if (!fields.length) return this.findOne(schema, id);

    fields.push(`updated_at = NOW()`);
    params.push(id);

    const result = await this.dataSource.query(
      `UPDATE "${schema}".aves SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`,
      params,
    );

    return result[0];
  }

  async updateEstado(schema: string, id: string, estado: string) {
    await this.findOne(schema, id);
    const result = await this.dataSource.query(
      `UPDATE "${schema}".aves SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [estado, id],
    );
    return result[0];
  }

  async getEvaluacionesFisicas(schema: string, aveId: string) {
    return this.dataSource.query(
      `SELECT * FROM "${schema}".evaluaciones_fisicas WHERE ave_id = $1 ORDER BY fecha DESC`,
      [aveId],
    );
  }

  async addEvaluacionFisica(schema: string, aveId: string, data: any, userId: string) {
    await this.findOne(schema, aveId);

    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".evaluaciones_fisicas
        (ave_id, peso_gramos, talla_cm, longitud_espuela_mm, conformacion, score_patas, score_espuela, evaluador_id, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        aveId,
        data.pesoGramos,
        data.tallaCm,
        data.longitudEspuelaMm,
        data.conformacion,
        data.scorePatas,
        data.scoreEspuela,
        userId,
        data.notas,
      ],
    );

    // Actualizar peso actual en aves
    if (data.pesoGramos) {
      await this.dataSource.query(
        `UPDATE "${schema}".aves SET peso_gramos = $1, updated_at = NOW() WHERE id = $2`,
        [data.pesoGramos, aveId],
      );
    }

    return result[0];
  }

  async addEvaluacionTemperamento(schema: string, aveId: string, data: any, userId: string) {
    await this.findOne(schema, aveId);

    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".evaluaciones_temperamento
        (ave_id, agresividad, coraje, inteligencia, recuperacion, evaluador_id, notas)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        aveId,
        data.agresividad,
        data.coraje,
        data.inteligencia,
        data.recuperacion,
        userId,
        data.notas,
      ],
    );

    return result[0];
  }
}
