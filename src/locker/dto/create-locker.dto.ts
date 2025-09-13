import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class CreateLockerDto {
  @IsString()
  code: string;

  @IsNumber()
  location_id: number;

  @IsOptional()
  @IsNumber()
  status?: number;

  @IsOptional()
  @IsObject()
  compartments?: { [key: string]: number };
}
