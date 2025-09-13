import { PartialType } from '@nestjs/mapped-types';
import { CreateSizeDto } from './create-size.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateSizeDto extends PartialType(CreateSizeDto) {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  price_per_hour?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  width_cm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height_cm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  depth_cm?: number;
}

