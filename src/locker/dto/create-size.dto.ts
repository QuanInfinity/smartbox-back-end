import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateSizeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseFloat(value))
  price_per_hour: number;

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




