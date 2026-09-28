import { Module } from '@nestjs/common';
import { PeleasController } from './peleas.controller';
import { PeleasService } from './peleas.service';

@Module({
  controllers: [PeleasController],
  providers: [PeleasService],
  exports: [PeleasService],
})
export class PeleasModule {}
