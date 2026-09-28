import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PedigreeService } from './pedigree.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('pedigree')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pedigree')
export class PedigreeController {
  constructor(private readonly pedigreeService: PedigreeService) {}

  @Get(':aveId/arbol')
  @ApiOperation({ summary: 'Obtener árbol genealógico (hasta 4 generaciones)' })
  @ApiQuery({ name: 'generaciones', required: false, type: Number })
  getArbol(
    @TenantSchema() schema: string,
    @Param('aveId') aveId: string,
    @Query('generaciones') generaciones: number = 4,
  ) {
    return this.pedigreeService.getArbol(schema, aveId, Number(generaciones));
  }

  @Get(':aveId/coi')
  @ApiOperation({ summary: 'Calcular Coeficiente de Endogamia (COI) de un ave' })
  calcularCOI(@TenantSchema() schema: string, @Param('aveId') aveId: string) {
    return this.pedigreeService.calcularCOI(schema, aveId);
  }

  @Post('simular-cruce')
  @ApiOperation({ summary: 'Simular COI estimado de un posible cruce' })
  @ApiQuery({ name: 'galloId', required: true })
  @ApiQuery({ name: 'gallinaId', required: true })
  simularCruce(
    @TenantSchema() schema: string,
    @Query('galloId') galloId: string,
    @Query('gallinaId') gallinaId: string,
  ) {
    return this.pedigreeService.simularCruce(schema, galloId, gallinaId);
  }
}
