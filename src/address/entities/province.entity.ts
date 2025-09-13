import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { District } from './district.entity';

@Entity('provinces')
export class Province {
  @PrimaryGeneratedColumn()
  ProvinceId: number;

  @Column({ name: 'ProvinceName', length: 255 })
  ProvinceName: string;

  @Column({ name: 'StateCode', length: 100, nullable: true })
  StateCode: string;

  @OneToMany(() => District, district => district.province)
  districts: District[];
}
