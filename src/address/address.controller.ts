import { Controller, Get, Param } from '@nestjs/common';
import { AddressService } from './address.service';

@Controller('api')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get('provinces')
  async getAllProvinces() {
    const provinces = await this.addressService.getAllProvinces();
    return {
      success: true,
      data: provinces,
    };
  }

  @Get('districts/province/:provinceId')
  async getDistrictsByProvince(@Param('provinceId') provinceId: string) {
    const districts = await this.addressService.getDistrictsByProvince(+provinceId);
    return {
      success: true,
      data: districts,
    };
  }

  @Get('wards/district/:districtId')
  async getWardsByDistrict(@Param('districtId') districtId: string) {
    const wards = await this.addressService.getWardsByDistrict(+districtId);
    return {
      success: true,
      data: wards,
    };
  }
}
