import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from './entities/province.entity';
import { District } from './entities/district.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Province)
    private provinceRepository: Repository<Province>,
    @InjectRepository(District)
    private districtRepository: Repository<District>,
    @InjectRepository(Ward)
    private wardRepository: Repository<Ward>,
  ) {}

  async getAllProvinces(): Promise<Province[]> {
    return await this.provinceRepository.find({
      order: { ProvinceName: 'ASC' },
    });
  }

  async getDistrictsByProvince(provinceId: number): Promise<District[]> {
    return await this.districtRepository.find({
      where: { ProvinceId: provinceId, IsActive: 1 },
      order: { DistrictName: 'ASC' },
    });
  }

  async getWardsByDistrict(districtId: number): Promise<Ward[]> {
    return await this.wardRepository.find({
      where: { DistrictId: districtId, IsActive: 1 },
      order: { WardName: 'ASC' },
    });
  }
}
