// src/plots/plots.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlotsService } from './plots.service';
import { CreatePlotDto } from './dto/create-plot.dto';
import { UpdatePlotDto } from './dto/update-plot.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('plots')
export class PlotsController {
  constructor(private readonly service: PlotsService) {}

  @Roles('admin')
  @Post()
  create(@Body() dto: CreatePlotDto) {
    return this.service.create(dto);
  }

  @Roles('user', 'admin')
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Roles('user', 'admin')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePlotDto) {
    return this.service.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Roles('user', 'admin')
  @Get(':id/summary')
  summary(@Param('id') id: string) {
    return this.service.summary(id);
  }
}
