// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserDto, DeleteUserResponseDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Get(':uuid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    async findOne(@Param() readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
        return this.usersService.findOne(readUserDto);
    }

    @Put(':uuid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(@Body() updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        return this.usersService.update(updateUserDto);
    }

    @Delete(':uuid')
    async delete(@Body() deleteUserDto: DeleteUserDto): Promise<DeleteUserResponseDto> {
        return this.usersService.delete(deleteUserDto);
    }

    @Post('deactivate/:uuid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async deactivate(@Param('uuid') uuid: string): Promise<void> {
        return this.usersService.deactivate(uuid);
    }

    @Post('activate/:uuid')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.ADMIN)
    async activate(@Param('uuid') uuid: string): Promise<void> {
        return this.usersService.activate(uuid);
    }
}
