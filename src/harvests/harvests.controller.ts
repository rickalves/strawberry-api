// src/harvests/harvests.controller.ts
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { HarvestsService } from './harvests.service';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('harvests')
export class HarvestsController {
  constructor(private readonly service: HarvestsService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateHarvestDto) {
    return this.service.create(dto);
  }

  @Roles('user', 'admin')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles('user', 'admin')
  @Get('plot/:plotId')
  byPlot(@Param('plotId') plotId: string) {
    return this.service.byPlot(plotId);
  }
}
