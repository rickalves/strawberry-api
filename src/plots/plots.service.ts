// src/plots/plots.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plot } from './plot.entity';
import { Repository } from 'typeorm';
import { CreatePlotDto } from './dto/create-plot.dto';
import { UpdatePlotDto } from './dto/update-plot.dto';

@Injectable()
export class PlotsService {
  constructor(@InjectRepository(Plot) private repo: Repository<Plot>) {}

  create(dto: CreatePlotDto) {
    const plot = this.repo.create(dto);
    return this.repo.save(plot);
  }

  findAll() {
    return this.repo.find({ order: { nome: 'ASC' } });
  }

  async findOne(id: string) {
    const plot = await this.repo.findOne({ where: { id } });
    if (!plot) throw new NotFoundException('Canteiro não encontrado');
    return plot;
  }

  async update(id: string, dto: UpdatePlotDto) {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const plot = await this.findOne(id);
    await this.repo.remove(plot);
    return { ok: true };
  }

  // Resumo: total colhido (kg) no canteiro
  async summary(id: string): Promise<{ plotId: string; total_kg: number }> {
    const result = await this.repo
      .createQueryBuilder('p')
      .leftJoin('p.colheitas', 'h')
      .select('COALESCE(SUM(h.peso_kg), 0)', 'sum')
      .where('p.id = :id', { id })
      .getRawOne<{ sum: string | number }>();

    const total = Number(result?.sum ?? 0);
    return { plotId: id, total_kg: total };
  }
}
