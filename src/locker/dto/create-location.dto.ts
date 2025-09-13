import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsNumber()
  ProvinceId?: number;

  @IsOptional()
  @IsNumber()
  DistrictId?: number;

  @IsOptional()
  @IsNumber()
  WardId?: number;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsNumber()
  multiplier?: number;

  @IsOptional()
  @IsString()
  area_description?: string;
}



