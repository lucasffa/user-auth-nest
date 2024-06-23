import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserDto, DeleteUserResponseDto } from './dto/users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<CreateUserResponseDto> {
    const user = this.userRepository.create(createUserDto);
    await this.userRepository.save(user);
    return new CreateUserResponseDto({ uuid: user.uuid });
  }

  async findOne(readUserDto: ReadUserDto): Promise<ReadUserResponseDto> {
    const user = await this.userRepository.findOne({ where: { uuid: readUserDto.uuid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return new ReadUserResponseDto(user);
  }

  async findEntityById(uuid: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { uuid } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async update(updateUserDto: UpdateUserDto): Promise<UpdateUserResponseDto> {
    const user = await this.findEntityById(updateUserDto.uuid);
    Object.assign(user, updateUserDto);
    await this.userRepository.save(user);
    return new UpdateUserResponseDto({ uuid: user.uuid });
  }

  async delete(deleteUserDto: DeleteUserDto): Promise<DeleteUserResponseDto> {
    const user = await this.findEntityById(deleteUserDto.uuid);
    user.markAsDeleted();
    await this.userRepository.save(user);
    return new DeleteUserResponseDto('User successfully deleted');
  }

  async deactivate(uuid: string): Promise<void> {
    const user = await this.findEntityById(uuid);
    user.deactivate();
    await this.userRepository.save(user);
  }

  async activate(uuid: string): Promise<void> {
    const user = await this.findEntityById(uuid);
    user.activate();
    await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async save(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
