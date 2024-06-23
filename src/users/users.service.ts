import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserDto, DeleteUserResponseDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { email: createUserDto.email } });
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return new CreateUserResponseDto({ uuid: user.uuid });
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Error creating user');
    }
  }

  async findOne(readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
    try {
      const user = await this.userRepository.findOne({ where: { uuid: readUserDto.uuid } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return new ReadUserResponseDto(user);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user');
    }
  }

  async findEntityById(uuid: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({ where: { uuid } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error retrieving user');
   
    }
  }
    async update(uuidParam: string, updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
      try {
        const user = await this.findEntityById(uuidParam);
        Object.assign(user, updateUserDto);
  
        if (updateUserDto.password) {
          user.tempPassword = updateUserDto.password;
        }
  
        await this.userRepository.save(user);
        return new UpdateUserResponseDto({ uuid: user.uuid });
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error updating user');
      }
    }
  
    async delete(uuidParam: string): Promise<DeleteUserResponseDto> {
      try {
        console.log('UsersService.delete, uuidParam: ', uuidParam);
        const user = await this.findEntityById(uuidParam);
        user.markAsDeleted();
        await this.userRepository.save(user);
        return new DeleteUserResponseDto('User successfully deleted');
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error deleting user');
      }
    }
  
    async deactivate(uuid: string): Promise<void> {
      try {
        const user = await this.findEntityById(uuid);
        user.deactivate();
        await this.userRepository.save(user);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error deactivating user');
      }
    }
  
    async activate(uuid: string): Promise<void> {
      try {
        const user = await this.findEntityById(uuid);
        user.activate();
        await this.userRepository.save(user);
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error activating user');
      }
    }
  
    async findByEmail(email: string): Promise<User> {
      try {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
          throw new NotFoundException('User not found');
        }
        return user;
      } catch (error) {
        if (error instanceof NotFoundException) {
          throw error;
        }
        throw new InternalServerErrorException('Error retrieving user by email');
      }
    }
  
    async save(user: User): Promise<User> {
      try {
        return await this.userRepository.save(user);
      } catch (error) {
        throw new InternalServerErrorException('Error saving user');
      }
    }
  }
  