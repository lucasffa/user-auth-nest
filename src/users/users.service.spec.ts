// src/users/users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserResponseDto } from './dto/users.dto';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { Role } from '../common/enums/roles.enum';

const mockRepository = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password' };
      const user = new User();
      user.uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);
      jest.spyOn(repository, 'create').mockReturnValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.create(createUserDto);
      expect(result).toEqual(new CreateUserResponseDto({ uuid: user.uuid }));
    });

    it('should throw ConflictException if email is already in use', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(new User());

      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password' };
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.create(createUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findOne', () => {
    it('should return a user by uuid', async () => {
      const readUserDto: ReadUserDto = { uuid: 'uuid' };
      const user = new User();
      user.uuid = 'uuid';
      user.name = 'John Doe';
      user.email = 'john@example.com';
      user.role = Role.PATIENT;
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findOne(readUserDto);
      expect(result).toEqual(new ReadUserResponseDto(user));
    });

    it('should throw NotFoundException if user is not found', async () => {
      const readUserDto: ReadUserDto = { uuid: 'uuid' };
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(readUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const readUserDto: ReadUserDto = { uuid: 'uuid' };
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.findOne(readUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const user = new User();
      user.uuid = 'uuid';
      const uuidParam = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.update(user.uuid, updateUserDto);
      expect(result).toEqual(new UpdateUserResponseDto({ uuid: user.uuid }));
    });

    it('should throw NotFoundException if user is not found', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const uuidParam = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.update(uuidParam, updateUserDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const uuidParam = 'uuid';
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.update(uuidParam, updateUserDto)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const user = new User();
      const uuidParam = 'uuid';
      user.uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.delete(uuidParam);
      expect(result).toEqual(new DeleteUserResponseDto('User successfully deleted'));
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuidParam = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.delete(uuidParam)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const uuidParam = 'uuid';
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.delete(uuidParam)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const uuid = 'uuid';
      const user = new User();
      user.uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      await service.deactivate(uuid);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid, isDeleted: false } });
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.deactivate(uuid)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.deactivate(uuid)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('activate', () => {
    it('should activate a user', async () => {
      const uuid = 'uuid';
      const user = new User();
      user.uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      await service.activate(uuid);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { uuid, isDeleted: false, isActive: false } });
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.activate(uuid)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const uuid = 'uuid';
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.activate(uuid)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      const email = 'john@example.com';
      const user = new User();
      user.email = 'john@example.com';
      jest.spyOn(repository, 'findOne').mockResolvedValue(user);

      const result = await service.findByEmail(email);
      expect(result).toEqual(user);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email, isDeleted: false } });
    });

    it('should throw NotFoundException if user is not found', async () => {
      const email = 'john@example.com';
      jest.spyOn(repository, 'findOne').mockResolvedValue(null);

      await expect(service.findByEmail(email)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const email = 'john@example.com';
      jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());

      await expect(service.findByEmail(email)).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('save', () => {
    it('should save a user', async () => {
      const user = new User();
      jest.spyOn(repository, 'save').mockResolvedValue(user);

      const result = await service.save(user);
      expect(result).toEqual(user);
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const user = new User();
      jest.spyOn(repository, 'save').mockRejectedValue(new Error());

      await expect(service.save(user)).rejects.toThrow(InternalServerErrorException);
    });
  });
});
