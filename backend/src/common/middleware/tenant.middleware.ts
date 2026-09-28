import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from '../../modules/tenants/entities/tenant.entity';

/**
 * Middleware de resolución multi-tenant.
 * Estrategia: subdomain → galleropro.com/api/v1/... con header X-Tenant-Slug
 * En desarrollo: usar header X-Tenant-Slug directamente.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepo: Repository<Tenant>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Rutas públicas que no necesitan tenant
    const publicPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/register',
      '/api/v1/auth/refresh',
      '/api/v1/certificados/verificar',
      '/api/v1/landing',
      '/api/docs',
    ];

    const isPublic = publicPaths.some((p) => req.path.startsWith(p));
    if (isPublic) {
      return next();
    }

    // Resolver tenant desde header o subdominio
    const slug =
      req.headers['x-tenant-slug'] as string ||
      this.extractSubdomain(req.hostname);

    if (!slug) {
      return next(); // Sin tenant, continúa (rutas globales)
    }

    const tenant = await this.tenantRepo.findOne({
      where: { slug, isActive: true },
    });

    if (!tenant) {
      throw new NotFoundException(`Criadero '${slug}' no encontrado`);
    }

    // Inyectar en el request para uso posterior
    (req as any).tenantId = tenant.id;
    (req as any).tenantSchema = tenant.schemaName;
    (req as any).tenant = tenant;

    next();
  }

  private extractSubdomain(hostname: string): string | null {
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      return parts[0]; // ej: "micriadero" de "micriadero.galleropro.com"
    }
    return null;
  }
}
