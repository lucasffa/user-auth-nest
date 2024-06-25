// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserDto, DeleteUserResponseDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
        return this.usersService.create(createUserDto);
    }

    @Get(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    async findOne(@Param() readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
        return this.usersService.findOne(readUserDto);
    }

    @Put(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(@Param('uuid') uuidParam: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        return this.usersService.update(uuidParam, updateUserDto);
    }

    @Delete(':uuid')
    async delete(@Param('uuid') uuidParam: string): Promise<DeleteUserResponseDto> {
        return this.usersService.delete(uuidParam);
    }

    @Post('deactivate/:uuid')
    @Roles(Role.ADMIN)
    async deactivate(@Param('uuid') uuidParam: string): Promise<void> {
        return this.usersService.deactivate(uuidParam);
    }

    @Post('activate/:uuid')
    @Roles(Role.ADMIN)
    async activate(@Param('uuid') uuidParam: string): Promise<void> {
        return this.usersService.activate(uuidParam);
    }
}
