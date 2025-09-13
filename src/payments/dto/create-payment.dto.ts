import { IsString, IsNotEmpty, IsIn, IsNumber, IsPositive } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['card', 'momo', 'zalopay', 'payos'])
  method: string;
}
