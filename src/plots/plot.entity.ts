// src/plots/plot.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Harvest } from '../harvests/harvest.entity';

@Entity({ name: 'plots' })
export class Plot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nome: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  area_m2: number;

  @Column({ type: 'date', nullable: true })
  inicio_plantio?: string;

  @OneToMany(() => Harvest, (h) => h.plot)
  colheitas: Harvest[];
}
