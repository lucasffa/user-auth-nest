// src/users/dto/users.dto.ts

import { IsEmail, IsString, IsEnum, IsUUID, IsBoolean, IsDate } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsEnum(Role)
  role: Role;
}

export class CreateUserResponseDto {
  @IsUUID()
  uuid: string;

  constructor(user: Partial<CreateUserResponseDto>) {
    Object.assign(this, user);
  }
}

export class ReadUserDto {
  @IsUUID()
  uuid: string;
}

export class ReadUserResponseDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsEnum(Role)
  role: Role;

  @IsBoolean()
  isActive: boolean;

  @IsBoolean()
  isDeleted: boolean;

  @IsDate()
  lastActiveStatusAt: Date;

  @IsDate()
  lastDeletionAt: Date;

  @IsDate()
  lastLoginAt: Date;

  @IsDate()
  lastLogoutAt: Date;

  @IsDate()
  lastUpdateAt: Date;

  constructor(user: Partial<ReadUserResponseDto>) {
    Object.assign(this, user);
  }
}

export class UpdateUserDto {
  @IsUUID()
  uuid: string;

  @IsString()
  name?: string;

  @IsEmail()
  email?: string;

  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserResponseDto {
  @IsUUID()
  uuid: string;

  constructor(user: Partial<UpdateUserResponseDto>) {
    Object.assign(this, user);
  }
}

export class DeleteUserDto {
  @IsUUID()
  uuid: string;
}

export class DeleteUserResponseDto {
  @IsString()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}