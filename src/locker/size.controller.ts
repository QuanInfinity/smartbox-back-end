import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SizeService } from './size.service';
import { CreateSizeDto } from './dto/create-size.dto';
import { UpdateSizeDto } from './dto/update-size.dto';

@ApiTags('sizes')
@Controller('sizes')
export class SizeController {
  constructor(private readonly sizeService: SizeService) {}

  @ApiOperation({ summary: 'Tạo kích thước tủ khóa mới' })
  @ApiBody({ type: CreateSizeDto, description: 'Thông tin kích thước cần tạo' })
  @ApiResponse({ status: 201, description: 'Kích thước được tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 409, description: 'Tên kích thước đã tồn tại' })
  @Post()
  async create(@Body() createSizeDto: CreateSizeDto) {
    try {
      return await this.sizeService.create(createSizeDto);
    } catch (error) {
      if (error.status === 409) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Lấy danh sách tất cả kích thước' })
  @ApiResponse({ status: 200, description: 'Danh sách kích thước' })
  @Get()
  findAll() {
    return this.sizeService.findAll();
  }

  @ApiOperation({ summary: 'Lấy thông tin kích thước theo ID' })
  @ApiParam({ name: 'id', description: 'ID của kích thước', type: 'string' })
  @ApiResponse({ status: 200, description: 'Thông tin kích thước' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sizeService.findOne(+id);
  }

  @ApiOperation({ summary: 'Cập nhật thông tin kích thước' })
  @ApiParam({ name: 'id', description: 'ID của kích thước', type: 'string' })
  @ApiBody({ type: UpdateSizeDto, description: 'Thông tin cần cập nhật' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
  @ApiResponse({ status: 409, description: 'Tên kích thước đã tồn tại' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateSizeDto: UpdateSizeDto) {
    try {
      return await this.sizeService.update(+id, updateSizeDto);
    } catch (error) {
      if (error.status === 409) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }
      throw error;
    }
  }

  @ApiOperation({ summary: 'Xóa kích thước' })
  @ApiParam({ name: 'id', description: 'ID của kích thước', type: 'string' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy kích thước' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sizeService.remove(+id);
  }
}
