import { IsEmail, IsNotEmpty, IsString, MaxLength, IsOptional, IsPhoneNumber } from 'class-validator';

export class LoginDto {
  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  @MaxLength(20)
  phone?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  password: string;
}
