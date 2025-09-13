import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { User } from 'src/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}
  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }
  async login(loginDto: LoginDto) {
    const { email, phone, password } = loginDto;

    // Determine search criteria based on what's provided
    let whereClause: any;
    if (email) {
      whereClause = { email: email.trim().toLowerCase() };
    } else if (phone) {
      whereClause = { phone_number: phone.trim() };
    } else {
      throw new Error('Vui lòng cung cấp email hoặc số điện thoại');
    }

    const user = await this.userRepository.findOne({
      where: whereClause,
    });

    if (!user) {
      throw new Error('Không tìm thấy tài khoản của bạn');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Mật khẩu không đúng');
    }

    const payload = {
      id: user.user_id,
      username: user.email,
      phone_number: user.phone_number
    };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        phone: user.phone_number
      }
    };
  }


  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
