// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Logger } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserResponseDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);

    constructor(private readonly usersService: UsersService) { }

    @Post()
    async create(@Req() req: Request, @Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
        this.logger.log(`User ${req.user.uuid} is creating a new user with email: ${createUserDto.email}`);
        return this.usersService.create(createUserDto);
    }

    @Get(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    async findOne(@Req() req: Request, @Param() readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
        this.logger.log(`User ${req.user.uuid} is finding user with UUID: ${readUserDto.uuid}`);
        return this.usersService.findOne(readUserDto);
    }

    @Put(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    async update(@Req() req: Request, @Param('uuid') uuidParam: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        this.logger.log(`User ${req.user.uuid} is updating user with UUID: ${uuidParam}`);
        return this.usersService.update(uuidParam, updateUserDto);
    }

    @Delete(':uuid')
    async delete(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<DeleteUserResponseDto> {
        this.logger.log(`User ${req.user.uuid} is deleting user with UUID: ${uuidParam}`);
        return this.usersService.delete(uuidParam);
    }

    @Post('deactivate/:uuid')
    @Roles(Role.ADMIN)
    async deactivate(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<void> {
        this.logger.log(`User ${req.user.uuid} is deactivating user with UUID: ${uuidParam}`);
        return this.usersService.deactivate(uuidParam);
    }

    @Post('activate/:uuid')
    @Roles(Role.ADMIN)
    async activate(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<void> {
        this.logger.log(`User ${req.user.uuid} is activating user with UUID: ${uuidParam}`);
        return this.usersService.activate(uuidParam);
    }
}
