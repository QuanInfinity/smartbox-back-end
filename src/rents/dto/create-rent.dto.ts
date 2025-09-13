import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CreateRentDto {
  @IsInt()
  @IsNotEmpty()
  user_id: number;

  @IsInt()
  @IsNotEmpty()
  compartment_id: number;

  @IsInt()
  @IsOptional()
  rental_hours?: number;

  @IsString()
  @IsOptional()
  @IsIn(['short_term', 'long_term', 'delivery'])
  rental_type?: string;

  @IsString()
  @IsOptional()
  receiver_phone?: string;
}
