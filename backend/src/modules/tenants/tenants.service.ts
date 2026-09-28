import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Tenant, PlanTenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  private readonly logger = new Logger(TenantsService.name);

  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateTenantDto): Promise<Tenant> {
    // Verificar slug único
    const existing = await this.tenantRepo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException(`El slug '${dto.slug}' ya está en uso`);
    }

    const schemaName = `t_${dto.slug.replace(/-/g, '_')}`;

    const tenant = this.tenantRepo.create({
      nombre: dto.nombre,
      slug: dto.slug,
      schemaName,
      ownerEmail: dto.ownerEmail,
      ownerName: dto.ownerName,
      pais: dto.pais,
      telefono: dto.telefono,
      plan: PlanTenant.FREE,
      maxAves: 25,
    });

    await this.tenantRepo.save(tenant);

    // Crear schema en PostgreSQL
    await this.createTenantSchema(schemaName);

    this.logger.log(`Tenant creado: ${dto.slug} -> schema: ${schemaName}`);
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { slug, isActive: true } });
    if (!tenant) {
      throw new NotFoundException(`Criadero '${slug}' no encontrado`);
    }
    return tenant;
  }

  async findById(id: string): Promise<Tenant> {
    const tenant = await this.tenantRepo.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException('Criadero no encontrado');
    }
    return tenant;
  }

  async updatePlan(tenantId: string, plan: PlanTenant): Promise<Tenant> {
    const tenant = await this.findById(tenantId);
    const maxAves = { FREE: 25, PRO: 200, ELITE: 999999 }[plan];
    tenant.plan = plan;
    tenant.maxAves = maxAves;
    return this.tenantRepo.save(tenant);
  }

  /**
   * Crea el schema PostgreSQL para el tenant e inicializa las tablas
   */
  private async createTenantSchema(schemaName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear schema
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);

      // Crear tablas del tenant
      await this.createTenantTables(queryRunner, schemaName);

      await queryRunner.commitTransaction();
      this.logger.log(`Schema '${schemaName}' creado correctamente`);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Error creando schema '${schemaName}':`, err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async createTenantTables(queryRunner: any, schema: string): Promise<void> {
    const s = `"${schema}"`;

    // Tabla aves
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.aves (
        id VARCHAR(20) PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('GALLO', 'GALLINA')),
        fecha_nacimiento DATE,
        origen VARCHAR(20) NOT NULL DEFAULT 'PROPIO',
        linea_genetica VARCHAR(100),
        color_plumaje VARCHAR(50),
        tipo_cresta VARCHAR(50),
        color_patas VARCHAR(50),
        peso_gramos INTEGER,
        talla_cm DECIMAL(5,1),
        longitud_espuela_mm DECIMAL(5,1),
        estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
        padre_id VARCHAR(20),
        madre_id VARCHAR(20),
        foto_url VARCHAR(500),
        qr_code VARCHAR(100),
        notas TEXT,
        sgt_score DECIMAL(4,2),
        coi DECIMAL(6,4),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla evaluaciones_fisicas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.evaluaciones_fisicas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ave_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        peso_gramos INTEGER,
        talla_cm DECIMAL(5,1),
        longitud_espuela_mm DECIMAL(5,1),
        conformacion DECIMAL(4,2),
        score_patas DECIMAL(4,2),
        score_espuela DECIMAL(4,2),
        evaluador_id UUID,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla evaluaciones_temperamento
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.evaluaciones_temperamento (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ave_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        agresividad DECIMAL(4,2) CHECK (agresividad BETWEEN 1 AND 10),
        coraje DECIMAL(4,2) CHECK (coraje BETWEEN 1 AND 10),
        inteligencia DECIMAL(4,2) CHECK (inteligencia BETWEEN 1 AND 10),
        recuperacion DECIMAL(4,2) CHECK (recuperacion BETWEEN 1 AND 10),
        evaluador_id UUID,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla sgt_scores (historial)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.sgt_scores (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ave_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        sgt DECIMAL(4,2) NOT NULL,
        d1_linaje DECIMAL(4,2),
        d2_rendimiento DECIMAL(4,2),
        d3_fisico DECIMAL(4,2),
        d4_temperamento DECIMAL(4,2),
        d5_salud DECIMAL(4,2),
        calculado_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla peleas
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.peleas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallo_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        evento VARCHAR(200),
        fecha DATE NOT NULL,
        lugar VARCHAR(200),
        peso_pelea_gramos INTEGER,
        rival_nombre VARCHAR(100),
        rival_criadero VARCHAR(100),
        resultado VARCHAR(10) NOT NULL CHECK (resultado IN ('VICTORIA','DERROTA','EMPATE','MUERTE')),
        duracion_minutos INTEGER,
        lesiones TEXT,
        notas TEXT,
        registrado_por UUID,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla salud_registros
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.salud_registros (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ave_id VARCHAR(20) REFERENCES ${s}.aves(id),
        tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('VACUNA','MEDICAMENTO','REVISION','TRATAMIENTO','DESPARASITACION')),
        nombre VARCHAR(200) NOT NULL,
        fecha DATE NOT NULL,
        fecha_proxima DATE,
        dosis VARCHAR(100),
        veterinario VARCHAR(100),
        observaciones TEXT,
        completado BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla certificados
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.certificados (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ave_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        codigo VARCHAR(50) UNIQUE NOT NULL,
        tipo VARCHAR(30) DEFAULT 'PEDIGREE',
        emitido_at TIMESTAMP DEFAULT NOW(),
        pdf_url VARCHAR(500),
        qr_data TEXT,
        vigente BOOLEAN DEFAULT TRUE
      )
    `);

    // Tabla usuarios del tenant
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.usuarios (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(150) UNIQUE NOT NULL,
        nombre VARCHAR(100) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'ASISTENTE'
          CHECK (role IN ('ADMIN','ASISTENTE','VETERINARIO')),
        is_active BOOLEAN DEFAULT TRUE,
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla cruces (apareamientos planificados)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.cruces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        gallo_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        gallina_id VARCHAR(20) NOT NULL REFERENCES ${s}.aves(id),
        fecha_inicio DATE NOT NULL,
        fecha_fin DATE,
        huevos_producidos INTEGER DEFAULT 0,
        pollitos_nacidos INTEGER DEFAULT 0,
        pollitos_vivos INTEGER DEFAULT 0,
        coi_estimado DECIMAL(6,4),
        notas TEXT,
        estado VARCHAR(20) DEFAULT 'ACTIVO',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Tabla eventos_pelea
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS ${s}.eventos_pelea (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nombre VARCHAR(200) NOT NULL,
        fecha DATE NOT NULL,
        lugar VARCHAR(200),
        organizador VARCHAR(200),
        categoria_peso VARCHAR(50),
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
  }
}
