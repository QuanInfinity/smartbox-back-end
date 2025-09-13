import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  async create(@Body() createLocationDto: CreateLocationDto) {
    const location = await this.locationService.create(createLocationDto);
    return {
      success: true,
      data: location,
      message: 'Location created successfully',
    };
  }

  @Get()
  async findAll() {
    const locations = await this.locationService.findAll();
    return {
      success: true,
      data: locations,
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const location = await this.locationService.findOne(+id);
    return {
      success: true,
      data: location,
    };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    const location = await this.locationService.update(+id, updateLocationDto);
    return {
      success: true,
      data: location,
      message: 'Location updated successfully',
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.locationService.remove(+id);
    return {
      success: true,
      message: 'Location deleted successfully',
    };
  }
}