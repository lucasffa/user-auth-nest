// src/auth/dto/auth.dto.ts
import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    password: string;
}

export class LoginResponseDto {
    @IsString()
    token: string;
}

export class LogoutDto {
    @IsString()
    uuid: string;
}

export class LogoutResponseDto {
    @IsString()
    message: string;
}
