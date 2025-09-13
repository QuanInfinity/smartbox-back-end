import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  HttpStatus,
  HttpCode,
  ParseIntPipe
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-link')
  @HttpCode(HttpStatus.OK)
  async createPaymentLink(
    @Body() body: { rentId: number; amount: number }
  ) {
    const { rentId, amount } = body;
    const payment = await this.paymentsService.initiatePayment(rentId, {
      method: 'payos',
      amount: amount
    });
    return {
      success: true,
      checkoutUrl: payment.payment_url,
      message: 'Link thanh toán đã được tạo thành công'
    };
  }

  @Post('rents/:rentId/pay')
  @HttpCode(HttpStatus.OK)
  async initiatePayment(
    @Param('rentId', ParseIntPipe) rentId: number,
    @Body() createPaymentDto: CreatePaymentDto
  ) {
    const payment = await this.paymentsService.initiatePayment(rentId, createPaymentDto);
    return {
      success: true,
      data: payment,
      message: 'Thanh toán đã được khởi tạo thành công'
    };
  }

  @Post('callback')
  @HttpCode(HttpStatus.OK)
  async handlePaymentCallback(@Body() paymentCallbackDto: PaymentCallbackDto) {
    const result = await this.paymentsService.handlePaymentCallback(paymentCallbackDto);
    return {
      success: result.success,
      data: {
        rent_id: result.rent_id,
        transaction_id: result.transaction_id
      },
      message: result.message
    };
  }

  @Get()
  async findAll() {
    const payments = await this.paymentsService.findAll();
    return {
      success: true,
      data: payments
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const payment = await this.paymentsService.findOne(id);
    return {
      success: true,
      data: payment
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updatePaymentDto: UpdatePaymentDto
  ) {
    const payment = await this.paymentsService.update(id, updatePaymentDto);
    return {
      success: true,
      data: payment,
      message: 'Thanh toán đã được cập nhật thành công'
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.paymentsService.remove(id);
    return {
      success: true,
      message: result.message
    };
  }
}
