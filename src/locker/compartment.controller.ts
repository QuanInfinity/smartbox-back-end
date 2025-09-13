import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CompartmentService } from './compartment.service';
import { CreateCompartmentDto } from './dto/create-compartment.dto';
import { UpdateCompartmentDto } from './dto/update-compartment.dto';

@ApiTags('compartments')
@Controller('compartments')
export class CompartmentController {
  constructor(private readonly compartmentService: CompartmentService) {}

  @ApiOperation({ summary: 'Tạo ngăn tủ mới' })
  @ApiBody({ type: CreateCompartmentDto, description: 'Thông tin ngăn tủ cần tạo' })
  @ApiResponse({ status: 201, description: 'Ngăn tủ được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @Post()
  create(@Body() createCompartmentDto: CreateCompartmentDto) {
    return this.compartmentService.create(createCompartmentDto);
  }

  @ApiOperation({ summary: 'Lấy danh sách tất cả ngăn tủ' })
  @ApiResponse({ status: 200, description: 'Danh sách ngăn tủ' })
  @Get()
  findAll() {
    return this.compartmentService.findAll();
  }

  @ApiOperation({ summary: 'Lấy danh sách ngăn tủ theo locker ID' })
  @ApiParam({ name: 'lockerId', description: 'ID của tủ khóa', type: 'string' })
  @ApiResponse({ status: 200, description: 'Danh sách ngăn tủ theo locker' })
  @Get('locker/:lockerId')
  async findByLocker(@Param('lockerId') lockerId: string) {
    const compartments = await this.compartmentService.findByLocker(lockerId);
    return {
      success: true,
      data: compartments,
    };
  }

  @ApiOperation({ summary: 'Lấy thông tin ngăn tủ theo ID' })
  @ApiParam({ name: 'id', description: 'ID của ngăn tủ', type: 'string' })
  @ApiResponse({ status: 200, description: 'Thông tin ngăn tủ' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngăn tủ' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.compartmentService.findOne(+id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin ngăn tủ' })
  @ApiParam({ name: 'id', description: 'ID của ngăn tủ', type: 'string' })
  @ApiBody({ type: UpdateCompartmentDto, description: 'Thông tin cần cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngăn tủ' })
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCompartmentDto: UpdateCompartmentDto) {
    return this.compartmentService.update(+id, updateCompartmentDto);
  }

  @ApiOperation({ summary: 'Xóa ngăn tủ' })
  @ApiParam({ name: 'id', description: 'ID của ngăn tủ', type: 'string' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngăn tủ' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.compartmentService.remove(+id);
  }

  @ApiOperation({ summary: 'Mở ngăn tủ' })
  @ApiParam({ name: 'id', description: 'ID của ngăn tủ', type: 'string' })
  @ApiResponse({ status: 200, description: 'Mở ngăn tủ thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ngăn tủ' })
  @Patch(':id/open')
  async openCompartment(@Param('id') id: string) {
    await this.compartmentService.openCompartment(+id);
    return {
      success: true,
      message: 'Ngăn tủ đã được mở thành công',
    };
  }
}

