import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { LockerService } from './locker.service';
import { CreateLockerDto } from './dto/create-locker.dto';
import { UpdateLockerDto } from './dto/update-locker.dto';
import { OpenWithSharedKeyDto } from '../shared-keys/dto/open-with-shared-key.dto';

@ApiTags('lockers')
@Controller('locker')
export class LockerController {
  constructor(private readonly lockerService: LockerService) {}

  @ApiOperation({ summary: 'Tạo tủ khóa mới' })
  @ApiBody({ type: CreateLockerDto, description: 'Thông tin tủ khóa cần tạo' })
  @ApiResponse({ status: 201, description: 'Tủ khóa được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Post()
  create(@Body() createLockerDto: CreateLockerDto) {
    return this.lockerService.create(createLockerDto);
  }
  @ApiOperation({ summary: 'Lấy thống kê tủ khóa' })
  @ApiResponse({ status: 200, description: 'Thống kê chi tiết về các tủ khóa' })
  @Get('stats') // Best practice to use a specific path like 'stats'
  getLockerStats() {
    return this.lockerService.getLockerStats();
  }


  @ApiOperation({ summary: 'Lấy danh sách tất cả tủ khóa' })
  @ApiResponse({ status: 200, description: 'Danh sách tủ khóa' })
  @Get()
  findAll() {
    return this.lockerService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin tủ khóa theo ID' })
  @ApiParam({ name: 'id', description: 'ID của tủ khóa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Thông tin tủ khóa' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tủ khóa' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lockerService.findOne(id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin tủ khóa' })
  @ApiParam({ name: 'id', description: 'ID của tủ khóa', type: 'string' })
  @ApiBody({ type: UpdateLockerDto, description: 'Thông tin cần cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tủ khóa' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLockerDto: UpdateLockerDto) {
    return this.lockerService.update(id, updateLockerDto);
  }

  @ApiOperation({ summary: 'Xóa tủ khóa' })
  @ApiParam({ name: 'id', description: 'ID của tủ khóa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy tủ khóa' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lockerService.remove(id);
  }

  @ApiOperation({ summary: 'Mở tủ bằng quyền chia sẻ' })
  @ApiBody({ type: OpenWithSharedKeyDto, description: 'Thông tin để mở tủ bằng quyền chia sẻ' })
  @ApiResponse({ status: 200, description: 'Mở tủ thành công' })
  @ApiResponse({ status: 403, description: 'Không có quyền mở tủ hoặc đã hết hạn' })
  @Post('open-shared')
  async openWithSharedKey(@Body() openWithSharedKeyDto: OpenWithSharedKeyDto) {
    return await this.lockerService.openWithSharedKey(
      openWithSharedKeyDto.rent_id,
      openWithSharedKeyDto.receiver_phone
    );
  }
}
