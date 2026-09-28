import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsEnum,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TipoAve {
  GALLO = 'GALLO',
  GALLINA = 'GALLINA',
}

export enum OrigenAve {
  PROPIO = 'PROPIO',
  COMPRADO = 'COMPRADO',
  DONADO = 'DONADO',
}

export enum EstadoAve {
  ACTIVO = 'ACTIVO',
  RETIRADO = 'RETIRADO',
  MUERTO = 'MUERTO',
  VENDIDO = 'VENDIDO',
  DESCARTE = 'DESCARTE',
}

export class CreateAveDto {
  @ApiProperty({ example: '001', description: 'ID correlativo único del criadero' })
  @IsString()
  @MaxLength(20)
  id: string;

  @ApiProperty({ example: 'El Diablo' })
  @IsString()
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ enum: TipoAve, example: 'GALLO' })
  @IsEnum(TipoAve)
  tipo: TipoAve;

  @ApiProperty({ example: '2023-05-15', required: false })
  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @ApiProperty({ enum: OrigenAve, example: 'PROPIO', required: false })
  @IsOptional()
  @IsEnum(OrigenAve)
  origen?: OrigenAve;

  @ApiProperty({ example: 'Sweater', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lineaGenetica?: string;

  @ApiProperty({ example: 'Giro Colorado', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  colorPlumaje?: string;

  @ApiProperty({ example: 'Simple', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  tipoCresta?: string;

  @ApiProperty({ example: 'Amarilla', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  colorPatas?: string;

  @ApiProperty({ example: 2100, description: 'Peso actual en gramos', required: false })
  @IsOptional()
  @IsNumber()
  @Min(100)
  @Max(9999)
  pesoGramos?: number;

  @ApiProperty({ example: 58.5, description: 'Talla en cm', required: false })
  @IsOptional()
  @IsNumber()
  tallaCm?: number;

  @ApiProperty({ example: 32.5, description: 'Longitud de espuela en mm', required: false })
  @IsOptional()
  @IsNumber()
  longitudEspuelaMm?: number;

  @ApiProperty({ example: '001', description: 'ID del padre (gallo)', required: false })
  @IsOptional()
  @IsString()
  padreId?: string;

  @ApiProperty({ example: '005', description: 'ID de la madre (gallina)', required: false })
  @IsOptional()
  @IsString()
  madreId?: string;

  @ApiProperty({ example: 'Excelente recuperación en pelea', required: false })
  @IsOptional()
  @IsString()
  notas?: string;
}
