import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('usuarios')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Listar usuarios del criadero' })
  findAll(@TenantSchema() schema: string) {
    return this.usuariosService.findAll(schema);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener perfil de usuario' })
  findOne(@TenantSchema() schema: string, @Param('id') id: string) {
    return this.usuariosService.findOne(schema, id);
  }

  @Patch(':id/rol')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cambiar rol de un usuario (solo ADMIN)' })
  updateRole(
    @TenantSchema() schema: string,
    @Param('id') id: string,
    @Body('role') role: string,
    @Req() req: any,
  ) {
    return this.usuariosService.updateRole(schema, id, role, req.user.userId);
  }

  @Patch(':id/desactivar')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Desactivar usuario (solo ADMIN)' })
  desactivar(
    @TenantSchema() schema: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.usuariosService.desactivar(schema, id, req.user.userId);
  }

  @Patch('me/password')
  @ApiOperation({ summary: 'Cambiar mi contraseña' })
  cambiarPassword(
    @TenantSchema() schema: string,
    @Body() body: { passwordActual: string; passwordNuevo: string },
    @Req() req: any,
  ) {
    return this.usuariosService.cambiarPassword(
      schema,
      req.user.userId,
      body.passwordActual,
      body.passwordNuevo,
    );
  }
}
