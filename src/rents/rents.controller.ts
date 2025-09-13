import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
  HttpStatus,
  HttpCode,
  ParseIntPipe
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RentsService } from './rents.service';
import { CreateRentDto } from './dto/create-rent.dto';
import { UpdateRentDto } from './dto/update-rent.dto';
import { AuthGuard } from '../auth/auth.guard';
import { SharedKeysService } from '../shared-keys/shared-keys.service';

@Controller('api/rents')
export class RentsController {
  constructor(
    private readonly rentsService: RentsService,
    private readonly sharedKeysService: SharedKeysService
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRentDto: CreateRentDto) {
    const rent = await this.rentsService.createRent(createRentDto);
    return {
      success: true,
      data: rent,
      message: 'Đơn thuê đã được tạo thành công'
    };
  }

  @Get()
  async findAll() {
    const rents = await this.rentsService.findAll();
    return {
      success: true,
      data: rents
    };
  }

  @Get('my-rents')
  @UseGuards(AuthGuard)
  async getMyRents(@Request() req) {
    // Get userId from JWT payload (set in AuthGuard)
    const userId = req.user?.id;

    if (!userId) {
      throw new UnauthorizedException('Không thể xác thực người dùng');
    }

    const rents = await this.rentsService.findByUserId(userId);
    return {
      success: true,
      data: rents,
      message: 'Danh sách đơn thuê của bạn'
    };
  }

  @Get('deliveries-for-me')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Lấy danh sách đơn hàng chờ nhận' })
  @ApiResponse({ status: 200, description: 'Danh sách đơn hàng chờ nhận' })
  async getPendingDeliveries(@Request() req) {
    const userPhone = req.user?.phone_number;
    if (!userPhone) {
      throw new UnauthorizedException('User phone not found');
    }

    const deliveries = await this.rentsService.getPendingDeliveriesForPhone(userPhone);
    return {
      success: true,
      data: deliveries
    };
  }

  @Post('delivery')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Tạo đơn gửi hàng' })
  @ApiResponse({ status: 201, description: 'Tạo đơn gửi hàng thành công' })
  async createDelivery(
    @Request() req,
    @Body() body: { compartment_id: number; receiver_phone: string }
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const rent = await this.rentsService.createDeliveryRent(
      userId,
      body.compartment_id,
      body.receiver_phone
    );

    return {
      success: true,
      message: 'Đã tạo đơn gửi hàng thành công. Người nhận sẽ được thông báo để nhận hàng và thanh toán.',
      rent_id: rent.rent_id
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const rent = await this.rentsService.findOne(id);
    return {
      success: true,
      data: rent
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number, 
    @Body() updateRentDto: UpdateRentDto
  ) {
    const rent = await this.rentsService.update(id, updateRentDto);
    return {
      success: true,
      data: rent,
      message: 'Đơn thuê đã được cập nhật thành công'
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.rentsService.remove(id);
    return {
      success: true,
      message: result.message
    };
  }

  @Put(':id/complete')
  async completeRent(@Param('id', ParseIntPipe) id: number) {
    const rent = await this.rentsService.updateStatus(id, 0); // 0 = completed
    return {
      success: true,
      data: rent,
      message: 'Đơn thuê đã được hoàn thành'
    };
  }

  @Put(':id/pickup')
  async endShortTermRent(@Param('id', ParseIntPipe) id: number) {
    // End short-term rent: update pickup_time, end_time, and calculate total_cost
    const rent = await this.rentsService.endShortTermRent(id);
    return {
      success: true,
      data: rent,
      message: 'Đã kết thúc thuê và tính chi phí'
    };
  }

  @Put(':id/open')
  async recordLockerOpen(@Param('id', ParseIntPipe) id: number) {
    // Record locker open for long-term rental: only update pickup_time
    const rent = await this.rentsService.recordLockerOpen(id);
    return {
      success: true,
      data: rent,
      message: 'Đã ghi nhận mở tủ'
    };
  }

  @Post(':id/share')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Chia sẻ quyền truy cập tủ' })
  @ApiResponse({ status: 201, description: 'Chia sẻ thành công' })
  async shareAccess(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { receiver_phone: string; expires_in_minutes: number }
  ) {
    const senderId = req.user?.id;
    if (!senderId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const sharedKey = await this.sharedKeysService.create({
      rent_id: id,
      receiver_phone: body.receiver_phone,
      expires_in_minutes: body.expires_in_minutes
    }, senderId);

    return {
      success: true,
      message: 'Chia sẻ thành công',
      shared_key_id: sharedKey.shared_id
    };
  }



  @Post(':id/mock-payment')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Xử lý thanh toán giả' })
  @ApiResponse({ status: 200, description: 'Thanh toán giả thành công' })
  async processMockPayment(
    @Request() req, 
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { payment_method: string; transaction_id: string }
  ) {
    const userPhone = req.user?.phone_number;
    if (!userPhone) {
      throw new UnauthorizedException('User phone not found');
    }

    const result = await this.rentsService.processMockPayment(id, userPhone, body);
    return {
      success: true,
      message: 'Thanh toán giả đã được xử lý thành công',
      payment_method: body.payment_method,
      transaction_id: body.transaction_id,
      rent_id: result.rentId
    };
  }
}
