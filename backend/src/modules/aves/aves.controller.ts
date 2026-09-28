import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AvesService } from './aves.service';
import { CreateAveDto } from './dto/create-ave.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, Role } from '../../common/decorators/roles.decorator';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('aves')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('aves')
export class AvesController {
  constructor(private readonly avesService: AvesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.ASISTENTE)
  @ApiOperation({ summary: 'Registrar nueva ave (gallo o gallina)' })
  create(
    @Body() dto: CreateAveDto,
    @TenantSchema() schema: string,
    @Req() req: any,
  ) {
    return this.avesService.create(schema, req.user.tenantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas las aves del criadero' })
  @ApiQuery({ name: 'tipo', required: false, enum: ['GALLO', 'GALLINA'] })
  @ApiQuery({ name: 'estado', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @TenantSchema() schema: string,
    @Query('tipo') tipo?: string,
    @Query('estado') estado?: string,
    @Query('search') search?: string,
  ) {
    return this.avesService.findAll(schema, { tipo, estado, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener ficha completa de un ave' })
  findOne(@TenantSchema() schema: string, @Param('id') id: string) {
    return this.avesService.findOne(schema, id);
  }

  @Put(':id')
  @Roles(Role.ADMIN, Role.ASISTENTE)
  @ApiOperation({ summary: 'Actualizar datos de un ave' })
  update(
    @TenantSchema() schema: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAveDto>,
  ) {
    return this.avesService.update(schema, id, dto);
  }

  @Patch(':id/estado')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cambiar estado del ave (ACTIVO/RETIRADO/MUERTO/VENDIDO)' })
  updateEstado(
    @TenantSchema() schema: string,
    @Param('id') id: string,
    @Body('estado') estado: string,
  ) {
    return this.avesService.updateEstado(schema, id, estado);
  }

  @Get(':id/evaluaciones/fisicas')
  @ApiOperation({ summary: 'Historial de evaluaciones físicas' })
  getEvaluacionesFisicas(
    @TenantSchema() schema: string,
    @Param('id') id: string,
  ) {
    return this.avesService.getEvaluacionesFisicas(schema, id);
  }

  @Post(':id/evaluaciones/fisicas')
  @Roles(Role.ADMIN, Role.ASISTENTE)
  @ApiOperation({ summary: 'Registrar evaluación física' })
  addEvaluacionFisica(
    @TenantSchema() schema: string,
    @Param('id') aveId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.avesService.addEvaluacionFisica(schema, aveId, data, req.user.userId);
  }

  @Post(':id/evaluaciones/temperamento')
  @Roles(Role.ADMIN, Role.ASISTENTE)
  @ApiOperation({ summary: 'Registrar evaluación de temperamento' })
  addEvaluacionTemperamento(
    @TenantSchema() schema: string,
    @Param('id') aveId: string,
    @Body() data: any,
    @Req() req: any,
  ) {
    return this.avesService.addEvaluacionTemperamento(schema, aveId, data, req.user.userId);
  }
}
