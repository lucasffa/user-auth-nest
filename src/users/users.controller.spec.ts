// src/users/users.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, CreateUserResponseDto, ReadUserDto, ReadUserResponseDto, UpdateUserDto, UpdateUserResponseDto, DeleteUserDto, DeleteUserResponseDto } from './dto/users.dto';
import { NotFoundException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { Role } from '../common/enums/roles.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            deactivate: jest.fn(),
            activate: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password' };
      const createUserResponse: CreateUserResponseDto = { uuid: 'uuid' };

      jest.spyOn(service, 'create').mockResolvedValue(createUserResponse);

      expect(await controller.create(createUserDto)).toBe(createUserResponse);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException if email is already in use', async () => {
      const createUserDto: CreateUserDto = { name: 'John Doe', email: 'john@example.com', password: 'password' };

      jest.spyOn(service, 'create').mockImplementation(() => {
        throw new ConflictException('Email already in use');
      });

      await expect(controller.create(createUserDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findOne', () => {
    it('should return a user by uuid', async () => {
      const readUserDto: ReadUserDto = { uuid: 'uuid' };
      const readUserResponse: ReadUserResponseDto = {
        uuid: 'uuid',
        name: 'John Doe',
        email: 'john@example.com',
        role: Role.PATIENT,
        isActive: true,
        isDeleted: false,
        lastActiveStatusAt: new Date(),
        lastDeletionAt: new Date(),
        lastLoginAt: new Date(),
        lastLogoutAt: new Date(),
        lastUpdateAt: new Date(),
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(readUserResponse);

      expect(await controller.findOne(readUserDto)).toBe(readUserResponse);
      expect(service.findOne).toHaveBeenCalledWith(readUserDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const readUserDto: ReadUserDto = { uuid: 'uuid' };

      jest.spyOn(service, 'findOne').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.findOne(readUserDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const uuidParam = 'uuid';
      const updateUserResponse: UpdateUserResponseDto = { uuid: 'uuid' };

      jest.spyOn(service, 'update').mockResolvedValue(updateUserResponse);

      expect(await controller.update(uuidParam, updateUserDto)).toBe(updateUserResponse);
      expect(service.update).toHaveBeenCalledWith(uuidParam, updateUserDto);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const updateUserDto: UpdateUserDto = { name: 'John Doe', email: 'john@example.com' };
      const uuidParam = 'uuid';

      jest.spyOn(service, 'update').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.update(uuidParam, updateUserDto)).rejects.toThrow(NotFoundException);
    });
  });


  describe('delete', () => {
    it('should delete a user', async () => {
      const uuidParam = 'uuid';
      const deleteUserResponse: DeleteUserResponseDto = { message: 'User successfully deleted' };

      jest.spyOn(service, 'delete').mockResolvedValue(deleteUserResponse);

      expect(await controller.delete(uuidParam)).toBe(deleteUserResponse);
      expect(service.delete).toHaveBeenCalledWith(uuidParam);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuidParam = 'uuid';

      jest.spyOn(service, 'delete').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.delete(uuidParam)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate a user', async () => {
      const uuid = 'uuid';

      jest.spyOn(service, 'deactivate').mockResolvedValue();

      await controller.deactivate(uuid);
      expect(service.deactivate).toHaveBeenCalledWith(uuid);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuid = 'uuid';

      jest.spyOn(service, 'deactivate').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.deactivate(uuid)).rejects.toThrow(NotFoundException);
    });
  });

  describe('activate', () => {
    it('should activate a user', async () => {
      const uuid = 'uuid';

      jest.spyOn(service, 'activate').mockResolvedValue();

      await controller.activate(uuid);
      expect(service.activate).toHaveBeenCalledWith(uuid);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const uuid = 'uuid';

      jest.spyOn(service, 'activate').mockImplementation(() => {
        throw new NotFoundException('User not found');
      });

      await expect(controller.activate(uuid)).rejects.toThrow(NotFoundException);
    });
  });
});
