import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
  ) {}

  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create({
      name: createLocationDto.name,
      address: createLocationDto.address,
      ProvinceId: createLocationDto.ProvinceId,
      DistrictId: createLocationDto.DistrictId,
      WardId: createLocationDto.WardId,
      latitude: createLocationDto.latitude,
      longitude: createLocationDto.longitude,
      multiplier: createLocationDto.multiplier || 1.00,
      area_description: createLocationDto.area_description,
    });
    return await this.locationRepository.save(location);
  }

  async findAll(): Promise<any[]> {
    try {
      console.log('🔍 Fetching all locations...');
      const locations = await this.locationRepository.find({
        relations: ['lockers', 'province', 'district', 'ward'],
        order: { location_id: 'DESC' },
      });
      console.log('✅ Found locations:', locations.length);
      
      return locations.map(location => ({
        ...location,
        total_lockers: location.lockers?.length || 0,
        active_lockers: location.lockers?.filter(locker => locker.status === 1).length || 0,
        full_address: this.buildFullAddress(location),
      }));
    } catch (error) {
      console.error('❌ Error in findAll locations:', error);
      throw error;
    }
  }

  private buildFullAddress(location: any): string {
    const parts: string[] = [];
    
    if (location.address) parts.push(location.address);
    if (location.ward?.WardName) parts.push(location.ward.WardName);
    if (location.district?.DistrictName) parts.push(location.district.DistrictName);
    if (location.province?.ProvinceName) parts.push(location.province.ProvinceName);
    
    return parts.join(', ');
  }

  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({
      where: { location_id: id },
      relations: ['lockers'],
    });
    
    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }
    
    return location;
  }

  async update(id: number, updateLocationDto: UpdateLocationDto): Promise<Location> {
    const location = await this.findOne(id);
    
    Object.assign(location, {
      name: updateLocationDto.name ?? location.name,
      address: updateLocationDto.address ?? location.address,
      latitude: updateLocationDto.latitude ?? location.latitude,
      longitude: updateLocationDto.longitude ?? location.longitude,
      multiplier: updateLocationDto.multiplier ?? location.multiplier,
      area_description: updateLocationDto.area_description ?? location.area_description,
      ProvinceId: updateLocationDto.ProvinceId ?? location.ProvinceId,
      DistrictId: updateLocationDto.DistrictId ?? location.DistrictId,
      WardId: updateLocationDto.WardId ?? location.WardId,
    });
    
    return await this.locationRepository.save(location);
  }

  async remove(id: number): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}










