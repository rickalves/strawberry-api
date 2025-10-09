import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Harvest } from './harvest.entity';
import { Plot } from '../plots/plot.entity';
import { HarvestsService } from './harvests.service';
import { HarvestsController } from './harvests.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Harvest, Plot])],
  controllers: [HarvestsController],
  providers: [HarvestsService],
})
export class HarvestsModule {}
