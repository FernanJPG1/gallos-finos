import { Controller, Get, Post, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PeleasService, CreatePeleaDto } from './peleas.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('peleas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('peleas')
export class PeleasController {
  constructor(private readonly peleasService: PeleasService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASISTENTE)
  @ApiOperation({ summary: 'Registrar resultado de pelea' })
  create(@TenantSchema() schema: string, @Body() dto: CreatePeleaDto, @Req() req: any) {
    return this.peleasService.create(schema, dto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las peleas' })
  findAll(
    @TenantSchema() schema: string,
    @Query('galloId') galloId?: string,
    @Query('resultado') resultado?: string,
    @Query('fechaDesde') fechaDesde?: string,
  ) {
    return this.peleasService.findAll(schema, { galloId, resultado, fechaDesde });
  }

  @Get('gallo/:galloId')
  @ApiOperation({ summary: 'Historial de peleas de un gallo' })
  findByAve(@TenantSchema() schema: string, @Param('galloId') galloId: string) {
    return this.peleasService.findByAve(schema, galloId);
  }

  @Get('gallo/:galloId/estadisticas')
  @ApiOperation({ summary: 'Estadísticas de peleas de un gallo' })
  getEstadisticas(@TenantSchema() schema: string, @Param('galloId') galloId: string) {
    return this.peleasService.getEstadisticas(schema, galloId);
  }
}
