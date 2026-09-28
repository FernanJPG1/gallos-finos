import { Module } from '@nestjs/common';
import { AvesController } from './aves.controller';
import { AvesService } from './aves.service';
import { TenantsModule } from '../tenants/tenants.module';

@Module({
  imports: [TenantsModule],
  controllers: [AvesController],
  providers: [AvesService],
  exports: [AvesService],
})
export class AvesModule {}
