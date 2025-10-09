// src/harvests/harvests.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Harvest } from './harvest.entity';
import { Repository } from 'typeorm';
import { CreateHarvestDto } from './dto/create-harvest.dto';
import { Plot } from '../plots/plot.entity';

@Injectable()
export class HarvestsService {
  constructor(
    @InjectRepository(Harvest) private repo: Repository<Harvest>,
    @InjectRepository(Plot) private plots: Repository<Plot>,
  ) {}

  async create(dto: CreateHarvestDto) {
    const plot = await this.plots.findOne({ where: { id: dto.plotId } });
    if (!plot) throw new NotFoundException('Canteiro não encontrado');

    const harvest = this.repo.create({
      plot,
      data: dto.data,
      peso_kg: dto.peso_kg,
      qualidade: dto.qualidade,
    });
    return this.repo.save(harvest);
  }

  findAll() {
    return this.repo.find({ relations: ['plot'], order: { data: 'DESC' } });
  }

  async byPlot(plotId: string) {
    return this.repo.find({
      where: { plot: { id: plotId } },
      relations: ['plot'],
      order: { data: 'DESC' },
    });
  }
}
