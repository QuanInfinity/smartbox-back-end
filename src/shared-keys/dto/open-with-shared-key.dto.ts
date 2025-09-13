import { IsInt, IsString, IsNotEmpty, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OpenWithSharedKeyDto {
  @ApiProperty({
    description: 'ID của đơn thuê',
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
}
