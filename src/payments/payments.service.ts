import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Payment } from './entities/payment.entity';
import { RentsService } from '../rents/rents.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    private readonly rentsService: RentsService,
  ) {}

  async initiatePayment(rentId: number, createPaymentDto: CreatePaymentDto) {
    try {
      const rent = await this.rentsService.findOne(rentId);

      // Check if rent can be paid:
      // - Long-term rental: has end_time AND total_cost set at creation, status = 1 for pre-payment
      // - Short-term rental: end_time and total_cost set when completed, status = 0 for post-payment
      const isLongTermRental = rent.end_time !== null && rent.total_cost !== null && rent.status === 1;
      const isShortTermCompleted = rent.end_time !== null && rent.total_cost !== null && rent.status === 0 && rent.pickup_time !== null;

      if (!isLongTermRental && !isShortTermCompleted) {
        throw new ConflictException('Đơn thuê này không ở trạng thái có thể thanh toán.');
      }

      const payment = this.paymentsRepository.create({
        rent_id: rentId,
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        status: 'pending',
      });

      const savedPayment = await this.paymentsRepository.save(payment);

      const paymentUrls = {
        momo: `https://test-payment.momo.vn/pay?orderId=${rentId}&amount=${createPaymentDto.amount}`,
        zalopay: `https://sb-openapi.zalopay.vn/pay?orderId=${rentId}&amount=${createPaymentDto.amount}`,
        card: `https://payment-gateway.com/pay?orderId=${rentId}&amount=${createPaymentDto.amount}`,
        payos: `https://api-merchant.payos.vn/pay?orderId=${rentId}&amount=${createPaymentDto.amount}`,
        cash: null
      };

      return {
        ...savedPayment,
        payment_url: paymentUrls[createPaymentDto.method as keyof typeof paymentUrls],
        message: 'Vui lòng hoàn tất thanh toán qua liên kết được cung cấp.'
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Không thể khởi tạo thanh toán.');
    }
  }

  async handlePaymentCallback(paymentCallbackDto: PaymentCallbackDto) {
    try {
      const rent = await this.rentsService.findOne(paymentCallbackDto.rent_id);

      if (paymentCallbackDto.status === 'success') {
        // Update payment status
        await this.paymentsRepository.update(
          { rent_id: paymentCallbackDto.rent_id },
          {
            transaction_id: paymentCallbackDto.transaction_id,
            status: 'paid',
            payment_time: new Date(),
          }
        );

        return {
          success: true,
          message: 'Thanh toán thành công.',
          rent_id: paymentCallbackDto.rent_id,
          transaction_id: paymentCallbackDto.transaction_id
        };
      } else {
        // Payment failed - update compartment status back to available
        // await this.compartmentsService.updateStatus(rent.compartment_id, 1);

        await this.paymentsRepository.update(
          { rent_id: paymentCallbackDto.rent_id },
          {
            transaction_id: paymentCallbackDto.transaction_id,
            status: 'failed',
            payment_time: new Date(),
          }
        );

        return {
          success: false,
          message: 'Thanh toán thất bại. Ngăn tủ đã được giải phóng.',
          rent_id: paymentCallbackDto.rent_id,
          transaction_id: paymentCallbackDto.transaction_id
        };
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Không thể xử lý callback thanh toán.');
    }
  }

  async findAll() {
    return await this.paymentsRepository.find({
      relations: ['rent', 'rent.user', 'rent.compartment'],
      order: { payment_time: 'DESC' }
    });
  }

  async findOne(id: number) {
    const payment = await this.paymentsRepository.findOne({
      where: { payment_id: id },
      relations: ['rent']
    });
    
    if (!payment) {
      throw new NotFoundException('Thanh toán không tồn tại.');
    }
    
    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return await this.paymentsRepository.save(payment);
  }

  async remove(id: number) {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
    return { message: 'Thanh toán đã được xóa thành công.' };
  }
}
