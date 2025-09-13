import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, DataSource } from 'typeorm';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { Rent } from './entities/rent.entity';
import { Compartment } from '../locker/entities/compartment.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class RentsService {
  constructor(
    @InjectRepository(Rent)
    private readonly rentsRepository: Repository<Rent>,
    @InjectRepository(Compartment)
    private readonly compartmentsRepository: Repository<Compartment>,
    private userService: UserService,
    private dataSource: DataSource,
  ) {}

  async createRent(createRentDto: CreateRentDto) {
    try {
      // Check compartment availability
      const compartment = await this.compartmentsRepository.findOne({
        where: { compartment_id: createRentDto.compartment_id },
        relations: ['size', 'locker', 'locker.location']
      });

      if (!compartment || compartment.status !== 1) {
        throw new ConflictException('Ngăn tủ này không có sẵn.');
      }

      // Get price_per_hour from compartment size and location multiplier
      const pricePerHour = compartment.size.price_per_hour * (compartment.locker.location.multiplier || 1);
      const startTime = new Date();

      let endTime: Date | null = null;
      let totalCost: number | null = null;

      // If rental_hours is provided, this is a long-term rental
      if (createRentDto.rental_hours) {
        endTime = new Date(startTime.getTime() + createRentDto.rental_hours * 60 * 60 * 1000);
        totalCost = createRentDto.rental_hours * pricePerHour;
      }

      const rentData: any = {
        user_id: createRentDto.user_id,
        compartment_id: createRentDto.compartment_id,
        start_time: startTime,
        end_time: endTime,
        total_cost: totalCost,
        price_per_hour: pricePerHour,
        status: 1, // active
        rental_type: createRentDto.rental_type || 'short_term',
      };

      const newRent = this.rentsRepository.create(rentData);

      const savedRent = await this.rentsRepository.save(newRent);

      // Update compartment status to occupied (status = 0)
      compartment.status = 0;
      await this.compartmentsRepository.save(compartment);

      return savedRent;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Không thể tạo đơn thuê. Vui lòng thử lại.');
    }
  }

  async findOne(rentId: number) {
    const rent = await this.rentsRepository.findOne({
      where: { rent_id: rentId },
      relations: ['user', 'compartment', 'compartment.locker', 'compartment.size']
    });
    
    if (!rent) {
      throw new NotFoundException('Đơn thuê không tồn tại.');
    }
    
    return rent;
  }

  async updateStatus(rentId: number, status: number) {
    const rent = await this.findOne(rentId);
    rent.status = status;
    
    if (status === 0) { // completed
      rent.end_time = new Date();
      // Calculate total cost based on duration
      const duration = (rent.end_time.getTime() - rent.start_time.getTime()) / (1000 * 60 * 60); // hours
      rent.total_cost = Math.ceil(duration) * (rent.price_per_hour || 0);
    }
    
    return await this.rentsRepository.save(rent);
  }

  async findAll() {
    return await this.rentsRepository.find({
      relations: ['user', 'compartment', 'compartment.locker'],
      order: { start_time: 'DESC' }
    });
  }

  async findByUserId(userId: number) {
    return await this.rentsRepository.find({
      where: { user_id: userId },
      relations: ['user', 'compartment', 'compartment.size', 'compartment.locker', 'compartment.locker.location'],
      order: { start_time: 'DESC' }
    });
  }

  async update(id: number, updateRentDto: UpdateRentDto) {
    const rent = await this.findOne(id);
    Object.assign(rent, updateRentDto);
    return await this.rentsRepository.save(rent);
  }

  async remove(id: number) {
    const rent = await this.findOne(id);
    await this.rentsRepository.remove(rent);
    return { message: 'Đơn thuê đã được xóa thành công.' };
  }



  async endShortTermRent(id: number) {
    const rent = await this.findOne(id);
    const now = new Date();

    // Calculate total cost based on actual time
    const startTime = new Date(rent.start_time);
    const hoursUsed = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60 * 60));

    // Get price from compartment size and location multiplier
    const compartment = await this.compartmentsRepository.findOne({
      where: { compartment_id: rent.compartment_id },
      relations: ['size', 'locker', 'locker.location']
    });

    if (!compartment || !compartment.size || !compartment.locker?.location) {
      throw new NotFoundException('Không tìm thấy thông tin ngăn tủ');
    }

    const pricePerHour = compartment.size.price_per_hour * (compartment.locker.location.multiplier || 1);
    const totalCost = hoursUsed * pricePerHour;

    // Update rent with end time and total cost
    rent.pickup_time = now;
    rent.end_time = now;
    rent.total_cost = totalCost;
    rent.status = 0; // completed

    // Free up the compartment
    compartment.status = 1; // available
    await this.compartmentsRepository.save(compartment);

    return await this.rentsRepository.save(rent);
  }

  async recordLockerOpen(id: number) {
    const rent = await this.findOne(id);

    // Only update pickup_time, don't affect end_time or status
    rent.pickup_time = new Date();

    return await this.rentsRepository.save(rent);
  }

  async createDeliveryRent(userId: number, compartmentId: number, receiverPhone: string): Promise<Rent> {
    // Kiểm tra số điện thoại người nhận có tồn tại trong database
    const receiverUser = await this.userService.findByPhoneNumber(receiverPhone);
    if (!receiverUser) {
      console.log('Receiver phone not found in database:', receiverPhone);
      throw new NotFoundException('Không tìm thấy người dùng với số điện thoại này. Vui lòng kiểm tra lại số điện thoại.');
    }

    console.log('Receiver user found:', { user_id: receiverUser.user_id, name: receiverUser.name, phone: receiverUser.phone_number });

    // Sử dụng transaction để đảm bảo rollback nếu có lỗi
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check compartment availability
      const compartment = await queryRunner.manager.findOne(Compartment, {
        where: { compartment_id: compartmentId },
        relations: ['size', 'locker', 'locker.location']
      });

      if (!compartment || compartment.status !== 1) {
        throw new ConflictException('Ngăn tủ này không có sẵn.');
      }

      // Get price_per_hour from compartment size and location multiplier
      const pricePerHour = compartment.size.price_per_hour * (compartment.locker.location.multiplier || 1);

      // Create delivery rent with special properties
      const rent = queryRunner.manager.create(Rent, {
        user_id: userId,
        compartment_id: compartmentId,
        start_time: new Date(),
        end_time: null as Date | null, // Will be set when receiver accepts
        total_cost: null as number | null, // Will be calculated when receiver accepts
        price_per_hour: pricePerHour, // Set price for later calculation
        status: 1, // Active
        rental_type: 'delivery', // Mark as delivery
        receiver_phone: receiverPhone, // Store receiver phone
      });

      const savedRent = await queryRunner.manager.save(rent);

      console.log('✅ Created delivery rent:', {
        rent_id: savedRent.rent_id,
        user_id: savedRent.user_id,
        receiver_phone: savedRent.receiver_phone,
        rental_type: savedRent.rental_type,
        status: savedRent.status,
        compartment_id: savedRent.compartment_id
      });

      // Mark compartment as occupied
      compartment.status = 0; // occupied
      await queryRunner.manager.save(compartment);

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedRent;
    } catch (error) {
      // Rollback transaction nếu có lỗi
      await queryRunner.rollbackTransaction();
      console.error('Error creating delivery rent, transaction rolled back:', error);
      throw error;
    } finally {
      // Giải phóng query runner
      await queryRunner.release();
    }
  }

  async getPendingDeliveriesForPhone(receiverPhone: string): Promise<Rent[]> {
    console.log('🔍 Searching for deliveries with phone:', receiverPhone);
    
    const deliveries = await this.rentsRepository.find({
      where: {
        receiver_phone: receiverPhone,
        rental_type: 'delivery',
        status: 1, // Active
        end_time: IsNull(), // Not yet completed
      },
      relations: [
        'user', // Sender info
        'compartment',
        'compartment.size',
        'compartment.locker',
        'compartment.locker.location'
      ],
      order: { start_time: 'DESC' }
    });
    
    console.log('📦 Found deliveries:', deliveries.length);
    console.log('📋 Delivery details:', deliveries.map(d => ({
      rent_id: d.rent_id,
      receiver_phone: d.receiver_phone,
      rental_type: d.rental_type,
      status: d.status,
      end_time: d.end_time
    })));
    
    return deliveries;
  }

  async processMockPayment(rentId: number, receiverPhone: string, paymentData: {
    payment_method: string;
    transaction_id: string;
  }): Promise<{
    rentId: number;
    totalCost: number;
  }> {
    // Find the delivery rent
    const rent = await this.rentsRepository.findOne({
      where: {
        rent_id: rentId,
        receiver_phone: receiverPhone,
        rental_type: 'delivery',
        status: 1,
        end_time: IsNull(),
      },
      relations: ['compartment', 'compartment.size', 'compartment.locker', 'compartment.locker.location']
    });

    if (!rent) {
      throw new NotFoundException('Không tìm thấy đơn gửi hàng hợp lệ');
    }

    // Calculate total cost based on actual time
    const now = new Date();
    const startTime = rent.start_time;
    const hoursUsed = Math.ceil((now.getTime() - startTime.getTime()) / (1000 * 60 * 60));

    // Get price from compartment size
    const pricePerHour = rent.compartment?.size?.price_per_hour || 0;
    const locationMultiplier = rent.compartment?.locker?.location?.multiplier || 1;
    const totalCost = hoursUsed * pricePerHour * locationMultiplier;

    // Update rent with end time and total cost
    rent.end_time = now;
    rent.total_cost = totalCost;
    rent.price_per_hour = pricePerHour;
    rent.status = 0; // Mark as completed

    await this.rentsRepository.save(rent);

    // Free up the compartment
    const compartment = await this.compartmentsRepository.findOne({
      where: { compartment_id: rent.compartment_id }
    });
    if (compartment) {
      compartment.status = 1; // available
      await this.compartmentsRepository.save(compartment);
    }

    console.log('✅ Mock payment processed:', {
      rent_id: rentId,
      payment_method: paymentData.payment_method,
      transaction_id: paymentData.transaction_id,
      total_cost: totalCost,
      hours_used: hoursUsed
    });

    return {
      rentId,
      totalCost
    };
  }
}
