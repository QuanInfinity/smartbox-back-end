import { PartialType } from '@nestjs/mapped-types';
import { CreateLockerDto } from './create-locker.dto';
import { IsOptional, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateLockerDto extends PartialType(CreateLockerDto) {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  location_id?: number;

  @IsOptional()
  @IsNumber()
  status?: number;
}
