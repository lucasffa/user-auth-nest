// src/users/users.service.ts
import { Injectable, NotFoundException, InternalServerErrorException, ConflictException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserResponseDto } from './dto/users.dto';
import { CustomLoggerService } from '../common/services/custom-logger.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject(CustomLoggerService) private readonly logger: CustomLoggerService,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    this.logger.logService(UsersService.name, `Creating user with email: ${createUserDto.email}`);
    try {
      const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      delete user.password;
      return new CreateUserResponseDto({ uuid: user.uuid });
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error creating user with email: ${createUserDto.email}`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findOne(readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
    this.logger.logService(UsersService.name, `Finding user with UUID: ${readUserDto.uuid}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid: readUserDto.uuid, isDeleted: false } });
      this.logger.logService(UsersService.name, `Found this user.name: ` + user.name);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      delete user.password;
      return new ReadUserResponseDto(user);
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error finding user with UUID: ${readUserDto.uuid}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async findOneByUuid(uuid: string): Promise<ReadUserResponseDto> {
    this.logger.logService(UsersService.name, `Finding user with UUID: ${uuid}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid, isDeleted: false } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      this.logger.logService(UsersService.name, `Found this user.name: ` + user.name);
      delete user.password;
      return new ReadUserResponseDto(user);
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error finding user with UUID: ${uuid}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async update(uuidParam: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
    this.logger.logService(UsersService.name, `Updating user with UUID: ${uuidParam}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid: uuidParam, isDeleted: false } });
      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (updateUserDto.email && updateUserDto.email !== user.email) {
        const existingUser = await this.userRepository.findOne({ where: { email: updateUserDto.email } });
        if (existingUser) {
          throw new ConflictException('Email already in use');
        }
      }

      Object.assign(user, updateUserDto);

      if (updateUserDto.password) {
        user.tempPassword = updateUserDto.password;
      }

      await this.userRepository.save(user);
      delete user.password;
      return new UpdateUserResponseDto({ uuid: user.uuid });
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error updating user with UUID: ${uuidParam}`, error);
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating user');
    }
  }

  async delete(uuidParam: string): Promise<DeleteUserResponseDto> {
    this.logger.logService(UsersService.name, `Deleting user with UUID: ${uuidParam}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid: uuidParam, isDeleted: false } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.markAsDeleted();
      await this.userRepository.save(user);
      return new DeleteUserResponseDto('User successfully deleted');
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error deleting user with UUID: ${uuidParam}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deleting user');
    }
  }

  async deactivate(uuid: string): Promise<void> {
    this.logger.logService(UsersService.name, `Deactivating user with UUID: ${uuid}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid, isDeleted: false } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.deactivate();
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error deactivating user with UUID: ${uuid}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error deactivating user');
    }
  }

  async activate(uuid: string): Promise<void> {
    this.logger.logService(UsersService.name, `Activating user with UUID: ${uuid}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid, isActive: false } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      user.activate();
      await this.userRepository.save(user);
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error activating user with UUID: ${uuid}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error activating user');
    }
  }

  async findByEmail(email: string): Promise<User> {
    this.logger.logService(UsersService.name, `Finding user by email: ${email}`);
    try {
      const user = await this.userRepository.findOne({
        where: { email, isDeleted: false },
        select: ['uuid', 'name', 'email', 'password', 'role', 'isActive', 'isDeleted', 'lastActiveStatusAt', 'lastDeletionAt', 'lastLoginAt', 'lastLogoutAt', 'lastUpdateAt'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error finding user by email: ${email}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user by email');
    }
  }

  async save(user: User): Promise<User> {
    this.logger.logService(UsersService.name, `Saving user with UUID: ${user.uuid}`);
    try {
      return await this.userRepository.save(user);
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error saving user with UUID: ${user.uuid}`, error);
      throw new InternalServerErrorException('Error saving user');
    }
  }

  async findEntityById(uuid: string): Promise<User> {
    //this.logger.logService(UsersService.name, `Finding user entity by UUID: ${uuid}`);
    try {
      const user = await this.userRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      this.logger.errorService(UsersService.name, `Error finding user entity by UUID: ${uuid}`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user');
    }
  }
}
