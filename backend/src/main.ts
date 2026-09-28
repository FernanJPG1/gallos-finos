import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // Cookie parser (para JWT refresh token en HttpOnly cookie)
  app.use(cookieParser());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Validation global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('GALLERO PRO API')
    .setDescription('API para gestión de criaderos de gallos de combate')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación y sesiones')
    .addTag('tenants', 'Gestión de criaderos (multi-tenant)')
    .addTag('aves', 'Gallos y gallinas')
    .addTag('sgt', 'Score Genético Total')
    .addTag('pedigree', 'Árbol genealógico')
    .addTag('peleas', 'Registro de peleas')
    .addTag('salud', 'Salud y vacunación')
    .addTag('certificados', 'Certificados de pedigree')
    .addTag('usuarios', 'Gestión de usuarios')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🐓 GALLERO PRO API corriendo en: http://localhost:${port}/api/v1`);
  console.log(`📚 Swagger disponible en: http://localhost:${port}/api/docs`);
}

bootstrap();
