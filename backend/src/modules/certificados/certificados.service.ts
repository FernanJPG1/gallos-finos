import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import * as QRCode from 'qrcode';

@Injectable()
export class CertificadosService {
  private readonly logger = new Logger(CertificadosService.name);
  private readonly PUBLIC_URL = 'https://verificar.galleropro.com/cert';

  constructor(private readonly dataSource: DataSource) {}

  async generarCertificado(schema: string, aveId: string, tenantSlug: string) {
    const ave = await this.dataSource.query(
      `SELECT a.*,
        p.nombre as padre_nombre, p.linea_genetica as padre_linea,
        m.nombre as madre_nombre, m.linea_genetica as madre_linea
       FROM "${schema}".aves a
       LEFT JOIN "${schema}".aves p ON a.padre_id = p.id
       LEFT JOIN "${schema}".aves m ON a.madre_id = m.id
       WHERE a.id = $1`,
      [aveId],
    );

    if (!ave.length) {
      throw new NotFoundException(`Ave '${aveId}' no encontrada`);
    }

    const aveData = ave[0];

    // Generar código único de certificado
    const codigo = `GP-${tenantSlug.toUpperCase()}-${aveId}-${Date.now().toString(36).toUpperCase()}`;

    // Generar QR con URL pública de verificación
    const urlVerificacion = `${this.PUBLIC_URL}/${codigo}`;
    const qrDataUrl = await QRCode.toDataURL(urlVerificacion, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'M',
    });

    // Guardar certificado en BD
    const result = await this.dataSource.query(
      `INSERT INTO "${schema}".certificados (ave_id, codigo, tipo, qr_data)
       VALUES ($1, $2, 'PEDIGREE', $3)
       ON CONFLICT (codigo) DO UPDATE SET qr_data = EXCLUDED.qr_data
       RETURNING *`,
      [aveId, codigo, urlVerificacion],
    );

    return {
      certificado: result[0],
      ave: aveData,
      codigo,
      urlVerificacion,
      qrDataUrl,
      emitidoAt: new Date().toISOString(),
    };
  }

  async verificarCertificado(codigo: string) {
    // Endpoint público - no requiere auth
    // Extraer schema del codigo: GP-TENANTSLUG-AVEID-HASH
    const partes = codigo.split('-');
    if (partes.length < 3) {
      throw new NotFoundException('Código de certificado inválido');
    }

    // Buscar en todos los schemas
    const tenants = await this.dataSource.query(
      `SELECT schema_name FROM public.tenants WHERE is_active = TRUE`,
    );

    for (const tenant of tenants) {
      const schema = tenant.schema_name;
      try {
        const cert = await this.dataSource.query(
          `SELECT c.*, a.nombre as ave_nombre, a.tipo, a.linea_genetica, a.sgt_score
           FROM "${schema}".certificados c
           JOIN "${schema}".aves a ON c.ave_id = a.id
           WHERE c.codigo = $1 AND c.vigente = TRUE`,
          [codigo],
        );

        if (cert.length) {
          return {
            valido: true,
            certificado: cert[0],
            verificadoAt: new Date().toISOString(),
          };
        }
      } catch {
        // Schema no tiene tabla certificados, continuar
      }
    }

    return {
      valido: false,
      mensaje: 'Certificado no encontrado o no vigente',
    };
  }

  async listarCertificados(schema: string, aveId?: string) {
    let query = `SELECT c.*, a.nombre as ave_nombre
                 FROM "${schema}".certificados c
                 JOIN "${schema}".aves a ON c.ave_id = a.id`;
    const params: any[] = [];

    if (aveId) {
      query += ` WHERE c.ave_id = $1`;
      params.push(aveId);
    }

    query += ` ORDER BY c.emitido_at DESC`;
    return this.dataSource.query(query, params);
  }

  async revocarCertificado(schema: string, id: string) {
    const result = await this.dataSource.query(
      `UPDATE "${schema}".certificados SET vigente = FALSE WHERE id = $1 RETURNING *`,
      [id],
    );
    if (!result.length) throw new NotFoundException('Certificado no encontrado');
    return result[0];
  }
}
