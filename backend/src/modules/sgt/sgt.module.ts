import { Module } from '@nestjs/common';
import { SgtController } from './sgt.controller';
import { SgtService } from './sgt.service';

@Module({
  controllers: [SgtController],
  providers: [SgtService],
  exports: [SgtService],
})
export class SgtModule {}
