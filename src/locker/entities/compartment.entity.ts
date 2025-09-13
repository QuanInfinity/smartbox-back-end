import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Locker } from './locker.entity';
import { Size } from './size.entity';

@Entity('compartments')
export class Compartment {
  @PrimaryGeneratedColumn()
  compartment_id: number;

  @Column()
  locker_id: number;

  @Column()
  size_id: number;

  @Column({ length: 10 })
  code: string;

  @Column({ type: 'int', default: 1 })
  status: number;

  @Column({ type: 'boolean', default: false })
  is_open: boolean;

  // ❌ Remove created_at, updated_at - không có trong database

  @ManyToOne(() => Locker, locker => locker.compartments)
  @JoinColumn({ name: 'locker_id' })
  locker: Locker;

  @ManyToOne(() => Size, size => size.compartments)
  @JoinColumn({ name: 'size_id' })
  size: Size;
}




