import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { TenantsService } from '../tenants/tenants.service';
import { LoginDto } from './dto/login.dto';
import { RegisterUserDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly tenantsService: TenantsService,
    private readonly dataSource: DataSource,
  ) {}

  async login(dto: LoginDto) {
    // 1. Resolver tenant
    const tenant = await this.tenantsService.findBySlug(dto.tenantSlug);

    // 2. Buscar usuario en schema del tenant
    const schema = tenant.schemaName;
    const users = await this.dataSource.query(
      `SELECT * FROM "${schema}".usuarios WHERE email = $1 AND is_active = TRUE LIMIT 1`,
      [dto.email],
    );

    if (!users || users.length === 0) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    const user = users[0];

    // 3. Verificar contraseña
    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 4. Actualizar last_login
    await this.dataSource.query(
      `UPDATE "${schema}".usuarios SET last_login = NOW() WHERE id = $1`,
      [user.id],
    );

    // 5. Generar tokens
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      tenantSchema: tenant.schemaName,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    this.logger.log(`Login: ${user.email} @ ${tenant.slug}`);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role,
      },
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        nombre: tenant.nombre,
        plan: tenant.plan,
        maxAves: tenant.maxAves,
      },
    };
  }

  async registerAdminUser(tenantSchema: string, dto: RegisterUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.dataSource.query(
      `INSERT INTO "${tenantSchema}".usuarios (email, nombre, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, nombre, role, created_at`,
      [dto.email, dto.nombre, passwordHash, dto.role || 'ASISTENTE'],
    );

    return result[0];
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('app.jwt.refreshSecret'),
      });

      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
        tenantId: payload.tenantId,
        tenantSlug: payload.tenantSlug,
        tenantSchema: payload.tenantSchema,
      };

      return {
        accessToken: this.generateAccessToken(newPayload),
      };
    } catch {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  private generateAccessToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.secret'),
      expiresIn: this.configService.get('app.jwt.expiresIn'),
    });
  }

  private generateRefreshToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload, {
      secret: this.configService.get('app.jwt.refreshSecret'),
      expiresIn: this.configService.get('app.jwt.refreshExpiresIn'),
    });
  }
}
