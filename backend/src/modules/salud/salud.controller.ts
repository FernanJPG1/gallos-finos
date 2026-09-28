import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SaludService, CreateSaludDto } from './salud.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('salud')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('salud')
export class SaludController {
  constructor(private readonly saludService: SaludService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar evento de salud (vacuna, tratamiento, etc.)' })
  create(@TenantSchema() schema: string, @Body() dto: CreateSaludDto) {
    return this.saludService.create(schema, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar registros de salud' })
  @ApiQuery({ name: 'aveId', required: false })
  @ApiQuery({ name: 'tipo', required: false })
  @ApiQuery({ name: 'mes', required: false, description: 'Formato YYYY-MM' })
  findAll(
    @TenantSchema() schema: string,
    @Query('aveId') aveId?: string,
    @Query('tipo') tipo?: string,
    @Query('mes') mes?: string,
  ) {
    return this.saludService.findAll(schema, { aveId, tipo, mes });
  }

  @Get('calendario')
  @ApiOperation({ summary: 'Obtener calendario de salud del mes' })
  @ApiQuery({ name: 'mes', description: 'Formato YYYY-MM' })
  getCalendario(@TenantSchema() schema: string, @Query('mes') mes: string) {
    return this.saludService.getCalendario(schema, mes);
  }

  @Get('proximos')
  @ApiOperation({ summary: 'Eventos de salud próximos' })
  @ApiQuery({ name: 'dias', required: false, type: Number })
  getProximos(@TenantSchema() schema: string, @Query('dias') dias: number = 30) {
    return this.saludService.getProximos(schema, Number(dias));
  }

  @Get('vencidos')
  @ApiOperation({ summary: 'Vacunas y tratamientos vencidos' })
  getVencidos(@TenantSchema() schema: string) {
    return this.saludService.getVencidos(schema);
  }

  @Patch(':id/completar')
  @ApiOperation({ summary: 'Marcar evento de salud como completado' })
  marcarCompletado(@TenantSchema() schema: string, @Param('id') id: string) {
    return this.saludService.marcarCompletado(schema, id);
  }

  @Post('init-protocolo')
  @ApiOperation({ summary: 'Inicializar protocolo de vacunación estándar' })
  initProtocolo(@TenantSchema() schema: string) {
    return this.saludService.initProtocolo(schema);
  }
}
