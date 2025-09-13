import { IsInt, IsString, IsNotEmpty, IsPhoneNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSharedKeyDto {
  @ApiProperty({
    description: 'ID của đơn thuê tủ',
    example: 1
  })
  @IsInt()
  @IsNotEmpty()
  rent_id: number;

  @ApiProperty({
    description: 'Số điện thoại người nhận quyền mở tủ',
    example: '0901234567'
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('VN', { message: 'Số điện thoại không hợp lệ' })
  receiver_phone: string;

  @ApiProperty({
    description: 'Thời gian hết hạn tính bằng phút (tối thiểu 5 phút, tối đa 1440 phút = 24 giờ)',
    example: 60,
    minimum: 5,
    maximum: 1440
  })
  @IsInt()
  @IsNotEmpty()
  @Min(5, { message: 'Thời gian hết hạn tối thiểu là 5 phút' })
  @Max(1440, { message: 'Thời gian hết hạn tối đa là 1440 phút (24 giờ)' })
  expires_in_minutes: number;
}