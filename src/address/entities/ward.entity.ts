import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { District } from './district.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn()
  WardId: number;

  @Column({ name: 'DistrictId' })
  DistrictId: number;

  @Column({ name: 'WardName', length: 255 })
  WardName: string;

  @Column({ name: 'IsActive', type: 'int' })
  IsActive: number;

  @ManyToOne(() => District, district => district.wards)
  @JoinColumn({ name: 'DistrictId' })
  district: District;
}
