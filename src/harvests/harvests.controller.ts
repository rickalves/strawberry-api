// src/harvests/harvests.controller.ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';

@Controller('harvests')
export class HarvestsController {
  constructor(private readonly service: HarvestsService) {}

  @Post()
  create(@Body() dto: CreateHarvestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('plot/:plotId')
  byPlot(@Param('plotId') plotId: string) {
    return this.service.byPlot(plotId);
  }
}
