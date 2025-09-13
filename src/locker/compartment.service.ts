import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCompartmentDto } from './dto/create-compartment.dto';
import { UpdateCompartmentDto } from './dto/update-compartment.dto';
import { Compartment } from './entities/compartment.entity';
import { Locker } from './entities/locker.entity';
import { Size } from './entities/size.entity';

@Injectable()
export class CompartmentService {
  constructor(
    @InjectRepository(Compartment)
    private compartmentRepository: Repository<Compartment>,
    @InjectRepository(Locker)
    private lockerRepository: Repository<Locker>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async create(createCompartmentDto: CreateCompartmentDto): Promise<Compartment> {
    // Verify locker exists
    const locker = await this.lockerRepository.findOne({
      where: { locker_id: parseInt(createCompartmentDto.locker_id) }
    });
    if (!locker) {
      throw new NotFoundException(`Locker with ID ${createCompartmentDto.locker_id} not found`);
    }

    // Verify size exists
    const size = await this.sizeRepository.findOne({
      where: { size_id: createCompartmentDto.size_id }
    });
    if (!size) {
      throw new NotFoundException(`Size with ID ${createCompartmentDto.size_id} not found`);
    }

    const compartment = this.compartmentRepository.create({
      code: createCompartmentDto.code, // ✅ Match entity field
      locker_id: parseInt(createCompartmentDto.locker_id),
      size_id: createCompartmentDto.size_id,
      status: createCompartmentDto.status || 1,
      is_open: createCompartmentDto.is_open || false,
    });
    return await this.compartmentRepository.save(compartment);
  }

  async findAll(): Promise<Compartment[]> {
    return await this.compartmentRepository.find({
      relations: ['locker', 'locker.location', 'size'],
      order: { compartment_id: 'DESC' }, // ✅ Use compartment_id instead
    });
  }

  async findByLocker(lockerId: string): Promise<Compartment[]> {
    return await this.compartmentRepository.find({
      where: { locker_id: parseInt(lockerId) },
      relations: ['locker', 'size'],
      order: { code: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Compartment> {
    const compartment = await this.compartmentRepository.findOne({
      where: { compartment_id: id },
      relations: ['locker', 'locker.location', 'size'],
    });
    
    if (!compartment) {
      throw new NotFoundException(`Compartment with ID ${id} not found`);
    }
    
    return compartment;
  }

  async update(id: number, updateCompartmentDto: UpdateCompartmentDto): Promise<Compartment> {
    const compartment = await this.findOne(id);
    
    if (updateCompartmentDto.locker_id) {
      const locker = await this.lockerRepository.findOne({
        where: { locker_id: parseInt(updateCompartmentDto.locker_id) }
      });
      if (!locker) {
        throw new NotFoundException(`Locker with ID ${updateCompartmentDto.locker_id} not found`);
      }
    }

    if (updateCompartmentDto.size_id) {
      const size = await this.sizeRepository.findOne({
        where: { size_id: updateCompartmentDto.size_id }
      });
      if (!size) {
        throw new NotFoundException(`Size with ID ${updateCompartmentDto.size_id} not found`);
      }
    }
    
    // ✅ Fix type conversion issue
    const updateData: any = { ...updateCompartmentDto };
    if (updateData.locker_id) {
      updateData.locker_id = parseInt(updateData.locker_id);
    }
    
    Object.assign(compartment, updateData);
    return await this.compartmentRepository.save(compartment);
  }

  async remove(id: number): Promise<void> {
    const compartment = await this.findOne(id);
    await this.compartmentRepository.remove(compartment);
  }

  async openCompartment(id: number): Promise<void> {
    const compartment = await this.findOne(id);
    compartment.is_open = true;
    await this.compartmentRepository.save(compartment);
    // Add hardware communication logic here
  }
}




