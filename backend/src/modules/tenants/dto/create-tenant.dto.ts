import { IsEmail, IsString, IsOptional, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'El Palomar de Oro' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'palomar-oro', description: 'Slug único (solo letras, números y guiones)' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'El slug solo puede contener letras minúsculas, números y guiones' })
  @MinLength(3)
  @MaxLength(50)
  slug: string;

  @ApiProperty({ example: 'admin@palomar.com' })
  @IsEmail()
  ownerEmail: string;

  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(3)
  ownerName: string;

  @ApiProperty({ example: 'MiPassword123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'México', required: false })
  @IsOptional()
  @IsString()
  pais?: string;

  @ApiProperty({ example: '+52 555 1234567', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;
}
