// src/users/users.controller.ts
import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Req, Inject, NotFoundException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserResponseDto, ReadOwnUserDto } from './dto/users.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/roles.enum';
import { CustomLoggerService } from '../common/services/custom-logger.service';
import { RateLimit } from '../common/decorators/rate-limit.decorator';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { Public } from 'src/common/decorators/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, RateLimitGuard)
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(CustomLoggerService) private readonly logger: CustomLoggerService,
    ) { }

    @Public()
    @Post()
    @RateLimit(5)
    async create(@Req() req: Request, @Body() createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
        this.logger.logRequest(req, UsersController.name, 'create');
        return this.usersService.create(createUserDto);
    }

    // TODO: fix uuid requirements
    @Get('me')
    @Roles(Role.ADMIN, Role.MANAGER, Role.OPERATOR, Role.PATIENT)
    @RateLimit(5)
    async findOwn(@Req() req: Request): Promise<ReadUserResponseDto> {
        const userUuid = req.user?.uuid;
        this.logger.logRequest(req, UsersController.name, 'findOwn');

        if (!userUuid) {
            throw new NotFoundException('User not found');
        }

        return this.usersService.findOne({ uuid: userUuid });
    }

    @Get(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    @RateLimit(5)
    async findOne(@Req() req: Request, @Param() readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
        this.logger.logRequest(req, UsersController.name, 'findOne');
        return this.usersService.findOne(readUserDto);
    }


    @Put(':uuid')
    @Roles(Role.ADMIN, Role.MANAGER)
    @RateLimit(5)
    async update(@Req() req: Request, @Param('uuid') uuidParam: string, @Body() updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
        this.logger.logRequest(req, UsersController.name, 'update');
        return this.usersService.update(uuidParam, updateUserDto);
    }

    @Delete(':uuid')
    @RateLimit(5)
    async delete(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<DeleteUserResponseDto> {
        this.logger.logRequest(req, UsersController.name, 'delete');
        return this.usersService.delete(uuidParam);
    }

    @Post('deactivate/:uuid')
    @Roles(Role.ADMIN)
    @RateLimit(5)
    async deactivate(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<void> {
        this.logger.logRequest(req, UsersController.name, 'deactivate');
        return this.usersService.deactivate(uuidParam);
    }

    @Post('activate/:uuid')
    @Roles(Role.ADMIN)
    @RateLimit(5)
    async activate(@Req() req: Request, @Param('uuid') uuidParam: string): Promise<void> {
        this.logger.logRequest(req, UsersController.name, 'activate');
        return this.usersService.activate(uuidParam);
    }
}
