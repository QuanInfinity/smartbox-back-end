import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hash = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      name : createUserDto.name,
      phone_number : createUserDto.phone_number,
      email : createUserDto.email,
      password : hash,
      role_id : createUserDto.role_id,
      status : createUserDto.status,
    });
    await this.userRepository.save(user);
    return user;
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);
    
    // Chỉ update password nếu có giá trị mới
    if (updateUserDto.password) {
      Object.assign(user, updateUserDto);
    } else {
      // Loại bỏ password khỏi update nếu không có giá trị
      const { password, ...updateData } = updateUserDto;
      Object.assign(user, updateData);
    }
    
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    return await this.userRepository.remove(user);
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { phone_number: phoneNumber } 
    });
  }
}
