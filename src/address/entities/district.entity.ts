import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Province } from './province.entity';
import { Ward } from './ward.entity';

@Entity('districts')
export class District {
  @PrimaryGeneratedColumn()
  DistrictId: number;

  @Column({ name: 'ProvinceId' })
  ProvinceId: number;

  @Column({ name: 'DistrictName', length: 255 })
  DistrictName: string;

  @Column({ name: 'IsActive', type: 'int' })
  IsActive: number;

  @ManyToOne(() => Province, province => province.districts)
  @JoinColumn({ name: 'ProvinceId' })
  province: Province;

  @OneToMany(() => Ward, ward => ward.district)
  wards: Ward[];
}
