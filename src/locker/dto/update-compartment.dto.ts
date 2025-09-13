import { PartialType } from '@nestjs/mapped-types';
import { CreateCompartmentDto } from './create-compartment.dto';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCompartmentDto extends PartialType(CreateCompartmentDto) {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  locker_id?: string; // ✅ Keep as string, convert in service

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  size_id?: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  is_open?: boolean;
}
