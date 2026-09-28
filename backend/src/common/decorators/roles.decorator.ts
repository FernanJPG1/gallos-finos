import { SetMetadata } from '@nestjs/common';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ASISTENTE = 'ASISTENTE',
  VETERINARIO = 'VETERINARIO',
}

export const ROLES_KEY = 'roles';

/**
 * Decora un endpoint con los roles permitidos
 * Uso: @Roles(Role.ADMIN, Role.VETERINARIO)
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
