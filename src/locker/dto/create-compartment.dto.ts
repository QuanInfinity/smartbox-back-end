import { IsNotEmpty, IsString, IsNumber, IsOptional, Length } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCompartmentDto {
  @ApiProperty({ 
    description: 'Mã ngăn tủ',
    example: 'C01',
    maxLength: 10
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 10)
  code: string;

  @ApiProperty({ 
    description: 'ID của tủ khóa',
    example: '1'
  })
  @IsNotEmpty()
  @IsString()
  locker_id: string;

  @ApiProperty({ 
    description: 'ID kích thước',
    example: 1
  })
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  size_id: number;

  @ApiPropertyOptional({ 
    description: 'Trạng thái ngăn tủ (1: có sẵn, 0: đã thuê, 2: bảo trì)',
    example: 1,
    default: 1
  })
  @IsOptional()
  @IsNumber()
  status?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Trạng thái mở/đóng',
    example: false,
    default: false
  })
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  is_open?: boolean = false;
}




