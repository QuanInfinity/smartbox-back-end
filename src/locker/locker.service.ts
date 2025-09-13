import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager,Repository } from 'typeorm';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';
import { Locker } from './entities/locker.entity';
import { Location } from './entities/location.entity';
import { Compartment } from './entities/compartment.entity';
import { Size } from './entities/size.entity';
import { SharedKey } from '../shared-keys/entities/shared-key.entity';

@Injectable()
export class LockerService {
  constructor(
    private entityManager: EntityManager,
    @InjectRepository(Locker)
    private lockerRepository: Repository<Locker>,
    @InjectRepository(Location)
    private locationRepository: Repository<Location>,
    @InjectRepository(Compartment)
    private compartmentRepository: Repository<Compartment>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(SharedKey)
    private sharedKeyRepository: Repository<SharedKey>,
  ) {}

  async getLockerStats(): Promise<any> {
    // Fetch all lockers and their related compartments from the database.
    // The exact method depends on your ORM (e.g., TypeORM, Prisma).
    // Using `find({ relations: ['compartments'] })` is common in TypeORM.
    const allLockers = await this.lockerRepository.find({ relations: ['compartments'] });

    if (!allLockers || allLockers.length === 0) {
        return {
            totalLockers: 0,
            activeLockers: 0,
            totalCompartments: 0,
            availableCompartments: 0,
            occupiedCompartments: 0,
           
        };
    }

    // Calculate total and active lockers
    const totalLockers = allLockers.length;
    const activeLockers = allLockers.filter(locker => locker.status === 1).length;

    let availableCompartments = 0;
    let totalCompartments = 0;

    // Loop through each locker to count its compartments
    for (const locker of allLockers) {
        if (locker.compartments && locker.compartments.length > 0) {
            totalCompartments += locker.compartments.length;
            // Count compartments that are marked as occupied
            availableCompartments += locker.compartments.filter(comp => comp.status === 1).length;
        }
    }

    const occupiedCompartments = totalCompartments - availableCompartments;

    // Return the final statistics object
    return {
        totalLockers,
        activeLockers,
        availableCompartments,
        occupiedCompartments,
        totalCompartments,
    };
}

  async create(createLockerDto: CreateLockerDto): Promise<Locker> {
    console.log('Received createLockerDto:', createLockerDto); // Debug log
    return this.entityManager.transaction(async (manager) => {
      // Verify location exists
      const location = await this.locationRepository.findOne({
        where: { location_id: createLockerDto.location_id }
      });
      
      if (!location) {
        throw new NotFoundException(`Location with ID ${createLockerDto.location_id} not found`);
      }

      // Create locker
      const locker = this.lockerRepository.create({
        code: createLockerDto.code,
        location_id: createLockerDto.location_id,
        status: createLockerDto.status || 1,
      });

      const savedLocker = await manager.save(locker);

      // Handle compartments creation
      const compartmentsToCreate: any[] = [];
      
      if (createLockerDto.compartments) {
        for (const [size_id, count] of Object.entries(createLockerDto.compartments)) {
          if (count > 0) {
            const size = await this.sizeRepository.findOne({
              where: { size_id: parseInt(size_id) }
            });

            if (!size) {
              throw new NotFoundException(`Size with ID ${size_id} not found`);
            }

            for (let i = 1; i <= count; i++) {
              const lockerNumber = savedLocker.code.replace(/\D/g, '');
              const compartmentCode = `${size.name.charAt(0)}${lockerNumber}-${i.toString().padStart(2, '0')}`;
              
              compartmentsToCreate.push({
                code: compartmentCode,
                locker_id: savedLocker.locker_id,
                size_id: parseInt(size_id),
                status: 1,
                is_open: false,
              });
            }
          }
        }
      }

      if (compartmentsToCreate.length > 0) {
        await manager.save(Compartment, compartmentsToCreate);
      }

      return savedLocker;
    });
  }
    

  async findAll(): Promise<Locker[]> {
    return await this.lockerRepository.find({
      relations: ['location', 'compartments', 'compartments.size'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Locker> {
    const locker = await this.lockerRepository.findOne({
      where: { locker_id: parseInt(id) },
      relations: ['location', 'compartments', 'compartments.size'],
    });
    
    if (!locker) {
      throw new NotFoundException(`Locker with ID ${id} not found`);
    }
    
    return locker;
  }

  async update(id: string, updateLockerDto: UpdateLockerDto): Promise<Locker> {
    const locker = await this.findOne(id);
    
    if (updateLockerDto.location_id) {
      const location = await this.locationRepository.findOne({
        where: { location_id: updateLockerDto.location_id }
      });
      
      if (!location) {
        throw new NotFoundException(`Location with ID ${updateLockerDto.location_id} not found`);
      }
    }
    
    Object.assign(locker, updateLockerDto);
    return await this.lockerRepository.save(locker);
  }

  async remove(id: string): Promise<void> {
    const locker = await this.findOne(id);
    await this.lockerRepository.remove(locker);
  }

  async getStats(): Promise<{
    total_lockers: number;
    active_lockers: number;
    total_compartments: number;
    available_compartments: number;
    occupied_compartments: number;
  }> {
    const totalLockers = await this.lockerRepository.count();
    const activeLockers = await this.lockerRepository.count({
      where: { status: 1 }
    });
    
    const totalCompartments = await this.compartmentRepository.count();
    const availableCompartments = await this.compartmentRepository.count({
      where: { status: 1 } // ✅ 1 = available
    });
    const occupiedCompartments = await this.compartmentRepository.count({
      where: { status: 0 } // ✅ 0 = occupied
    });

    return {
      total_lockers: totalLockers,
      active_lockers: activeLockers,
      total_compartments: totalCompartments,
      available_compartments: availableCompartments,
      occupied_compartments: occupiedCompartments,
    };
  }

  async openWithSharedKey(rentId: number, receiverPhone: string): Promise<{ success: boolean; message: string }> {
    // Tìm shared key hợp lệ
    const sharedKey = await this.sharedKeyRepository
      .createQueryBuilder('sk')
      .where('sk.rent_id = :rentId', { rentId })
      .andWhere('sk.receiver_phone = :receiverPhone', { receiverPhone })
      .andWhere('sk.used_at IS NULL')
      .andWhere('sk.expires_at > NOW()')
      .getOne();

    if (!sharedKey) {
      throw new ForbiddenException('Không tìm thấy quyền mở tủ hợp lệ hoặc đã hết hạn');
    }

    // Cập nhật trạng thái đã sử dụng
    await this.sharedKeyRepository.update(sharedKey.shared_id, {
      used_at: new Date()
    });

    return {
      success: true,
      message: 'Mở tủ thành công bằng quyền chia sẻ'
    };
  }
}
