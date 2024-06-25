// src/users/dto/users.dto.ts

import { IsEmail, IsString, IsEnum, IsUUID, IsBoolean, IsDate, IsOptional } from 'class-validator';
import { Role } from '../../common/enums/roles.enum';
import { Exclude } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
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
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
  
  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(Role)
  @IsOptional()
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
}

export class DeleteUserResponseDto {
  @IsString()
  message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class ReadOwnUserDto {
  @IsUUID()
  uuid: string;
}