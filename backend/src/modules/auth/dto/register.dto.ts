import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ example: 'nuevo@criadero.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Carlos López' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Password123!', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'ASISTENTE', enum: ['ADMIN', 'ASISTENTE', 'VETERINARIO'] })
  @IsString()
  role: string;
}
