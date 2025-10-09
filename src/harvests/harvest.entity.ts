// src/harvests/harvest.entity.ts
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Plot } from '../plots/plot.entity';

@Entity({ name: 'harvests' })
export class Harvest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Plot, (p) => p.colheitas, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  plot: Plot;

  @Index()
  @Column({ type: 'date' })
  data: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  peso_kg: number;

  @Column({ nullable: true })
  qualidade?: string; // Ex.: A, B, C
}
