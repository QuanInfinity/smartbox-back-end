import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Locker } from './locker.entity';
import { Province } from '../../address/entities/province.entity';
import { District } from '../../address/entities/district.entity';
import { Ward } from '../../address/entities/ward.entity';

@Entity('locker_locations')
export class Location {
  @PrimaryGeneratedColumn()
  location_id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ name: 'ProvinceId', nullable: true })
  ProvinceId?: number;

  @Column({ name: 'DistrictId', nullable: true })
  DistrictId?: number;

  @Column({ name: 'WardId', nullable: true })
  WardId?: number;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  multiplier: number;

  @Column({ type: 'text', nullable: true })
  area_description: string;

  @OneToMany(() => Locker, locker => locker.location)
  lockers: Locker[];

  @ManyToOne(() => Province)
  @JoinColumn({ name: 'ProvinceId' })
  province: Province;

  @ManyToOne(() => District)
  @JoinColumn({ name: 'DistrictId' })
  district: District;

  @ManyToOne(() => Ward)
  @JoinColumn({ name: 'WardId' })
  ward: Ward;
}





