// src/plots/plots.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plot } from './plot.entity';
import { PlotsController } from './plots.controller';
import { PlotsService } from './plots.service';

@Module({
  imports: [TypeOrmModule.forFeature([Plot])],
  controllers: [PlotsController],
  providers: [PlotsService],
  exports: [TypeOrmModule],
})
export class PlotsModule {}
