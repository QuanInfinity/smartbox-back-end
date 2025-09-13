import { IsNotEmpty, IsEmail, IsOptional, Length, IsPhoneNumber, IsInt, Min } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @Length(1, 100)
    name: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    @Length(1, 20)
    phone_number: string;

    @IsOptional()
    @IsEmail()
    @Length(1, 100)
    email?: string;

    @IsNotEmpty()
    @Length(1, 255)
    password: string;

    @IsInt()
    @Min(1)
    role_id: number;

    @IsOptional()
    @IsInt()
    status?: number;
}
