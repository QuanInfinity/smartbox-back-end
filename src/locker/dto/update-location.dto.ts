import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  multiplier?: number;

  @IsOptional()
  @IsString()
  area_description?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  province_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  district_id?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  ward_id?: number;
}
