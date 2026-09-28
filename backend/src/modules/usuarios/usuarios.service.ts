import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsuariosService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(schema: string) {
    return this.dataSource.query(
      `SELECT id, email, nombre, role, is_active, last_login, created_at
       FROM "${schema}".usuarios ORDER BY nombre`,
    );
  }

  async findOne(schema: string, id: string) {
    const result = await this.dataSource.query(
      `SELECT id, email, nombre, role, is_active, last_login, created_at
       FROM "${schema}".usuarios WHERE id = $1`,
      [id],
    );
    if (!result.length) throw new NotFoundException('Usuario no encontrado');
    return result[0];
  }

  async updateRole(schema: string, id: string, role: string, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenException('No puedes cambiar tu propio rol');
    }
    const result = await this.dataSource.query(
      `UPDATE "${schema}".usuarios SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, nombre, role`,
      [role, id],
    );
    if (!result.length) throw new NotFoundException('Usuario no encontrado');
    return result[0];
  }

  async desactivar(schema: string, id: string, requesterId: string) {
    if (id === requesterId) {
      throw new ForbiddenException('No puedes desactivarte a ti mismo');
    }
    const result = await this.dataSource.query(
      `UPDATE "${schema}".usuarios SET is_active = FALSE, updated_at = NOW() WHERE id = $1 RETURNING id, email, nombre, is_active`,
      [id],
    );
    if (!result.length) throw new NotFoundException('Usuario no encontrado');
    return result[0];
  }

  async cambiarPassword(schema: string, id: string, passwordActual: string, passwordNuevo: string) {
    const usuarios = await this.dataSource.query(
      `SELECT id, password_hash FROM "${schema}".usuarios WHERE id = $1`,
      [id],
    );
    if (!usuarios.length) throw new NotFoundException('Usuario no encontrado');

    const valido = await bcrypt.compare(passwordActual, usuarios[0].password_hash);
    if (!valido) throw new ForbiddenException('Contraseña actual incorrecta');

    const nuevoHash = await bcrypt.hash(passwordNuevo, 12);
    await this.dataSource.query(
      `UPDATE "${schema}".usuarios SET password_hash = $1, updated_at = NOW() WHERE id = $2`,
      [nuevoHash, id],
    );
    return { message: 'Contraseña actualizada correctamente' };
  }
}
