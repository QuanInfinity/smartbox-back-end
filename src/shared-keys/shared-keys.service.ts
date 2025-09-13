import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { SharedKey } from './entities/shared-key.entity';
import { CreateSharedKeyDto } from './dto/create-shared-key.dto';
import { Rent } from '../rents/entities/rent.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class SharedKeysService {
  constructor(
    @InjectRepository(SharedKey)
    private sharedKeyRepository: Repository<SharedKey>,
    @InjectRepository(Rent)
    private rentRepository: Repository<Rent>,
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  async create(createSharedKeyDto: CreateSharedKeyDto, senderId: number): Promise<SharedKey> {
    const { rent_id, receiver_phone, expires_in_minutes } = createSharedKeyDto;
    console.log('Creating shared key:', { rent_id, receiver_phone, expires_in_minutes, senderId });

    // Kiểm tra số điện thoại người nhận có tồn tại trong database
    const receiverUser = await this.userService.findByPhoneNumber(receiver_phone);
    if (!receiverUser) {
      console.log('Receiver phone not found in database:', receiver_phone);
      throw new NotFoundException('Không tìm thấy người dùng với số điện thoại này. Vui lòng kiểm tra lại số điện thoại.');
    }

    console.log('Receiver user found:', { user_id: receiverUser.user_id, name: receiverUser.name, phone: receiverUser.phone_number });

    // Sử dụng transaction để đảm bảo rollback nếu có lỗi
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Tìm đơn thuê
      const rent = await queryRunner.manager.findOne(Rent, {
        where: { rent_id },
        relations: ['user']
      });

      console.log('Found rent:', rent ? { id: rent.rent_id, user_id: rent.user_id, status: rent.status, end_time: rent.end_time } : 'null');

      if (!rent) {
        throw new NotFoundException('Không tìm thấy đơn thuê');
      }

      // Kiểm tra quyền sở hữu
      console.log('Checking ownership:', { rent_user_id: rent.user_id, senderId });
      if (rent.user_id !== senderId) {
        console.log('Ownership check failed');
        throw new ForbiddenException('Bạn không có quyền chia sẻ đơn thuê này');
      }

      // Kiểm tra trạng thái đơn thuê
      console.log('Checking rent status:', rent.status);
      if (rent.status !== 1) {
        console.log('Status check failed');
        throw new BadRequestException('Chỉ có thể chia sẻ đơn thuê đang hoạt động');
      }

      // Tính toán thời gian hết hạn
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + expires_in_minutes);

      console.log('Time validation:', {
        current_time: new Date(),
        expires_at: expiresAt,
        rent_end_time: rent.end_time,
        will_exceed: rent.end_time && expiresAt > rent.end_time
      });

      // Kiểm tra thời gian hết hạn
      if (rent.end_time && rent.end_time > new Date()) {
        // Rent chưa hết hạn - kiểm tra bình thường
        if (expiresAt > rent.end_time) {
          console.log('Time validation failed - expires_at exceeds rent.end_time');
          throw new BadRequestException('Thời gian hết hạn không được vượt quá thời gian kết thúc đơn thuê');
        }
      } else if (rent.end_time && rent.end_time <= new Date()) {
        // Rent đã hết hạn - chỉ cho phép chia sẻ tối đa 30 phút
        const maxExpiresAt = new Date();
        maxExpiresAt.setMinutes(maxExpiresAt.getMinutes() + 30);
        if (expiresAt > maxExpiresAt) {
          console.log('Time validation failed - rent expired, max 30 minutes allowed');
          throw new BadRequestException('Đơn thuê đã hết hạn. Chỉ có thể chia sẻ tối đa 30 phút.');
        }
      }

      // Tạo shared key mới
      console.log('Creating shared key with data:', { rent_id, sender_id: senderId, receiver_phone, expires_at: expiresAt });
      const sharedKey = queryRunner.manager.create(SharedKey, {
        rent_id,
        sender_id: senderId,
        receiver_phone,
        expires_at: expiresAt,
      });

      const savedKey = await queryRunner.manager.save(sharedKey);
      console.log('Shared key created successfully:', savedKey.shared_id);
      
      // Commit transaction
      await queryRunner.commitTransaction();
      return savedKey;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      console.error('Error creating shared key, transaction rolled back:', error);
      throw error;
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }

  async findByRent(rentId: number, requesterId: number): Promise<SharedKey[]> {
    // Kiểm tra quyền sở hữu đơn thuê
    const rent = await this.rentRepository.findOne({
      where: { rent_id: rentId }
    });

    if (!rent) {
      throw new NotFoundException('Không tìm thấy đơn thuê');
    }

    if (rent.user_id !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền xem danh sách chia sẻ của đơn thuê này');
    }

    return await this.sharedKeyRepository.find({
      where: { rent_id: rentId },
      order: { shared_at: 'DESC' }
    });
  }

  async revoke(sharedId: number, requesterId: number): Promise<void> {
    // Tìm shared key với thông tin đơn thuê
    const sharedKey = await this.sharedKeyRepository.findOne({
      where: { shared_id: sharedId },
      relations: ['rent']
    });

    if (!sharedKey) {
      throw new NotFoundException('Không tìm thấy quyền chia sẻ');
    }

    // Kiểm tra quyền sở hữu
    if (sharedKey.rent.user_id !== requesterId) {
      throw new ForbiddenException('Bạn không có quyền thu hồi quyền chia sẻ này');
    }

    // Xóa shared key
    await this.sharedKeyRepository.remove(sharedKey);
  }

  async findValidSharedKey(rentId: number, receiverPhone: string): Promise<SharedKey | null> {
    return await this.sharedKeyRepository.findOne({
      where: {
        rent_id: rentId,
        receiver_phone: receiverPhone,
        used_at: IsNull(),
      },
      relations: ['rent']
    });
  }

  async markAsUsed(sharedId: number): Promise<void> {
    await this.sharedKeyRepository.update(sharedId, {
      used_at: new Date()
    });
  }

  async findByReceiverPhone(receiverPhone: string): Promise<SharedKey[]> {
    return await this.sharedKeyRepository.find({
      where: {
        receiver_phone: receiverPhone,
        used_at: IsNull(), // Chưa sử dụng
      },
      relations: ['rent', 'rent.compartment', 'rent.compartment.locker', 'rent.compartment.locker.location', 'sender'],
      order: { shared_at: 'DESC' }
    });
  }

  async openSharedLocker(sharedId: number, userPhone: string): Promise<void> {
    // Tìm shared key
    const sharedKey = await this.sharedKeyRepository.findOne({
      where: {
        shared_id: sharedId,
        receiver_phone: userPhone,
        used_at: IsNull()
      },
      relations: ['rent']
    });

    if (!sharedKey) {
      throw new NotFoundException('Không tìm thấy quyền chia sẻ hợp lệ');
    }

    // Kiểm tra thời gian hết hạn
    if (sharedKey.expires_at && new Date() > sharedKey.expires_at) {
      throw new BadRequestException('Mã đã hết hạn hoặc không hợp lệ');
    }

    // Kiểm tra trạng thái đơn thuê
    if (sharedKey.rent.status !== 1) {
      throw new BadRequestException('Đơn thuê không còn hoạt động');
    }

    // Đánh dấu đã sử dụng
    await this.markAsUsed(sharedId);
  }
}
