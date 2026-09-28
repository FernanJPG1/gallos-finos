import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@micriadero.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'MiPassword123!' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'mi-criadero', description: 'Slug del criadero' })
  @IsString()
  tenantSlug: string;
}
