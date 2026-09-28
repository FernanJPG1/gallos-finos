import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SgtService } from './sgt.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('sgt')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sgt')
export class SgtController {
  constructor(private readonly sgtService: SgtService) {}

  @Post('calcular/:aveId')
  @ApiOperation({ summary: 'Calcular SGT de un ave específica' })
  calcular(@TenantSchema() schema: string, @Param('aveId') aveId: string) {
    return this.sgtService.calcularSgt(schema, aveId);
  }

  @Post('calcular-todos')
  @ApiOperation({ summary: 'Recalcular SGT de todas las aves activas' })
  calcularTodos(@TenantSchema() schema: string) {
    return this.sgtService.calcularTodos(schema);
  }

  @Get('recomendaciones')
  @ApiOperation({ summary: 'Obtener gallos recomendados para un evento' })
  @ApiQuery({ name: 'peso', type: Number, description: 'Peso del evento en gramos' })
  @ApiQuery({ name: 'fecha', type: String, description: 'Fecha del evento YYYY-MM-DD' })
  getRecomendaciones(
    @TenantSchema() schema: string,
    @Query('peso') peso: number,
    @Query('fecha') fecha: string,
  ) {
    return this.sgtService.getRecomendaciones(schema, Number(peso), fecha);
  }
}
