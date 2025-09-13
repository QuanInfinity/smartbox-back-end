import { IsInt, IsString, IsNotEmpty, IsIn } from 'class-validator';

export class PaymentCallbackDto {
  @IsInt()
  @IsNotEmpty()
  rent_id: number;

  @IsString()
  @IsNotEmpty()
  transaction_id: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['success', 'failure'])
  status: 'success' | 'failure';
}
