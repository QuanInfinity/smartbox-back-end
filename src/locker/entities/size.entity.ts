import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Compartment } from './compartment.entity';

@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  size_id: number;

  @Column({ length: 50 })
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price_per_hour: number;

  @Column({ type: 'int', nullable: true })
  width_cm?: number;

  @Column({ type: 'int', nullable: true })
  height_cm?: number;

  @Column({ type: 'int', nullable: true })
  depth_cm?: number;

  // ❌ Remove created_at, updated_at - không có trong database

  @OneToMany(() => Compartment, compartment => compartment.size)
  compartments: Compartment[];
}








