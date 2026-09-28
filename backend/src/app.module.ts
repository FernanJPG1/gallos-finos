import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { AvesModule } from './modules/aves/aves.module';
import { SgtModule } from './modules/sgt/sgt.module';
import { PedigreeModule } from './modules/pedigree/pedigree.module';
import { PeleasModule } from './modules/peleas/peleas.module';
import { SaludModule } from './modules/salud/salud.module';
import { CertificadosModule } from './modules/certificados/certificados.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    // Configuración global
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 60,
      },
    ]),

    // Base de datos
    DatabaseModule,

    // Módulos de negocio
    AuthModule,
    TenantsModule,
    UsuariosModule,
    AvesModule,
    SgtModule,
    PedigreeModule,
    PeleasModule,
    SaludModule,
    CertificadosModule,
  ],
})
export class AppModule {}
