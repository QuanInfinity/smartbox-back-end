import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';
import { Size } from './entities/size.entity';

@Injectable()
export class SizeService {
  constructor(
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
  ) {}

  async create(createSizeDto: CreateSizeDto): Promise<Size> {
    // Kiểm tra tên kích thước đã tồn tại chưa
    const existingSize = await this.sizeRepository.findOne({
      where: { name: createSizeDto.name }
    });

    if (existingSize) {
      throw new ConflictException(`Tên kích thước "${createSizeDto.name}" đã tồn tại. Vui lòng chọn tên khác.`);
    }

    const size = this.sizeRepository.create({
      name: createSizeDto.name, // ✅ Match entity field
      price_per_hour: createSizeDto.price_per_hour, // ✅ Match entity field
      width_cm: createSizeDto.width_cm,
      height_cm: createSizeDto.height_cm,
      depth_cm: createSizeDto.depth_cm,
    });
    return await this.sizeRepository.save(size);
  }

  async findAll(): Promise<Size[]> {
    const sizes = await this.sizeRepository.find({
      relations: ['compartments'],
      order: { size_id: 'DESC' },
    });
    
    console.log('Raw sizes from database:', sizes); // ✅ Debug log
    return sizes;
  }

  async findOne(id: number): Promise<Size> {
    const size = await this.sizeRepository.findOne({
      where: { size_id: id },
      relations: ['compartments'],
    });
    
    if (!size) {
      throw new NotFoundException(`Size with ID ${id} not found`);
    }
    
    console.log('Single size from database:', size); // ✅ Debug log
    return size;
  }

  async update(id: number, updateSizeDto: UpdateSizeDto): Promise<Size> {
    const size = await this.findOne(id);
    
    // Kiểm tra tên kích thước trùng lặp khi cập nhật
    if (updateSizeDto.name !== undefined && updateSizeDto.name !== size.name) {
      const existingSize = await this.sizeRepository.findOne({
        where: { name: updateSizeDto.name }
      });

      if (existingSize && existingSize.size_id !== id) {
        throw new ConflictException(`Tên kích thước "${updateSizeDto.name}" đã tồn tại. Vui lòng chọn tên khác.`);
      }
    }
    
    if (updateSizeDto.name !== undefined) {
      size.name = updateSizeDto.name;
    }
    if (updateSizeDto.price_per_hour !== undefined) {
      size.price_per_hour = updateSizeDto.price_per_hour;
    }
    if (updateSizeDto.width_cm !== undefined) {
      size.width_cm = updateSizeDto.width_cm;
    }
    if (updateSizeDto.height_cm !== undefined) {
      size.height_cm = updateSizeDto.height_cm;
    }
    if (updateSizeDto.depth_cm !== undefined) {
      size.depth_cm = updateSizeDto.depth_cm;
    }
    
    return await this.sizeRepository.save(size);
  }

  async remove(id: number): Promise<void> {
    const size = await this.findOne(id);
    await this.sizeRepository.remove(size);
  }
}






