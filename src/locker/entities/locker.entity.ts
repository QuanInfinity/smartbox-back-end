import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Location } from './location.entity';
import { Compartment } from './compartment.entity';

@Entity('lockers')
export class Locker {
  @PrimaryGeneratedColumn()
  locker_id: number;

  @Column({ length: 50, unique: true })
  code: string;

  @Column()
  location_id: number;

  @Column({ type: 'int', default: 1 })
  status: number; // 1: active, 0: inactive, 2: maintenance

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Location, location => location.lockers)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @OneToMany(() => Compartment, compartment => compartment.locker)
  compartments: Compartment[];
}
