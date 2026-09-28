import { Controller, Get, Post, Patch, Param, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificadosService } from './certificados.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantSchema } from '../../common/decorators/tenant.decorator';

@ApiTags('certificados')
@Controller('certificados')
export class CertificadosController {
  constructor(private readonly certificadosService: CertificadosService) {}

  // Endpoint PÚBLICO - verificación QR sin auth
  @Get('verificar/:codigo')
  @ApiOperation({ summary: 'Verificar certificado por código QR (público, sin auth)' })
  verificar(@Param('codigo') codigo: string) {
    return this.certificadosService.verificarCertificado(codigo);
  }

  // Endpoints protegidos
  @Post('generar/:aveId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Generar certificado de pedigree para un ave' })
  generar(
    @TenantSchema() schema: string,
    @Param('aveId') aveId: string,
    @Req() req: any,
  ) {
    return this.certificadosService.generarCertificado(schema, aveId, req.user.tenantSlug);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Listar certificados del criadero' })
  listar(
    @TenantSchema() schema: string,
    @Query('aveId') aveId?: string,
  ) {
    return this.certificadosService.listarCertificados(schema, aveId);
  }

  @Patch(':id/revocar')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Revocar un certificado' })
  revocar(@TenantSchema() schema: string, @Param('id') id: string) {
    return this.certificadosService.revocarCertificado(schema, id);
  }
}
