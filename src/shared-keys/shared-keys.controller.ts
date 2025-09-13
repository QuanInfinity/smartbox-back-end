import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { SharedKeysService } from './shared-keys.service';
import { CreateSharedKeyDto } from './dto/create-shared-key.dto';

@ApiTags('Shared Keys')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('shared-keys')
export class SharedKeysController {
  constructor(private readonly sharedKeysService: SharedKeysService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo quyền chia sẻ mở tủ' })
  @ApiResponse({ status: 201, description: 'Tạo quyền chia sẻ thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 403, description: 'Không có quyền thực hiện' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn thuê' })
  async create(@Body() createSharedKeyDto: CreateSharedKeyDto, @Request() req) {
    const senderId = req.user.user_id;
    const sharedKey = await this.sharedKeysService.create(createSharedKeyDto, senderId);
    
    return {
      success: true,
      message: 'Tạo quyền chia sẻ thành công',
      data: sharedKey
    };
  }

  @Get('rent/:rentId')
  @ApiOperation({ summary: 'Lấy danh sách quyền chia sẻ của đơn thuê' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền xem' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đơn thuê' })
  async findByRent(@Param('rentId', ParseIntPipe) rentId: number, @Request() req) {
    const requesterId = req.user.user_id;
    const sharedKeys = await this.sharedKeysService.findByRent(rentId, requesterId);
    
    return {
      success: true,
      data: sharedKeys
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Thu hồi quyền chia sẻ' })
  @ApiResponse({ status: 200, description: 'Thu hồi quyền thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền thu hồi' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quyền chia sẻ' })
  async revoke(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const requesterId = req.user.user_id;
    await this.sharedKeysService.revoke(id, requesterId);

    return {
      success: true,
      message: 'Thu hồi quyền chia sẻ thành công'
    };
  }

  @Get('my-shares')
  @ApiOperation({ summary: 'Lấy danh sách tủ được chia sẻ cho tôi' })
  @ApiResponse({ status: 200, description: 'Danh sách tủ được chia sẻ' })
  async getMyShares(@Request() req) {
    const userPhone = req.user.phone_number; // Use correct field name
    const sharedKeys = await this.sharedKeysService.findByReceiverPhone(userPhone);

    return {
      success: true,
      data: sharedKeys
    };
  }

  @Put(':id/open')
  @ApiOperation({ summary: 'Mở tủ bằng quyền chia sẻ' })
  @ApiResponse({ status: 200, description: 'Mở tủ thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền mở tủ hoặc đã hết hạn' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy quyền chia sẻ' })
  async openSharedLocker(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const userPhone = req.user.phone_number; // Use correct field name
    await this.sharedKeysService.openSharedLocker(id, userPhone);

    return {
      success: true,
      message: 'Lệnh mở tủ đã được gửi!'
    };
  }
}
