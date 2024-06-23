// src/auth/auth.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponseDto, LogoutResponseDto } from './dto/auth.dto';
import { User } from '../users/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { Role } from '../common/enums/roles.enum';
import { TOKEN_BLACKLIST } from './constants';
import { ITokenBlacklist } from './interfaces/token-blacklist.interface';
import { ConfigService } from '@nestjs/config';

const mockTokenBlacklistService = {
  blacklistToken: jest.fn(),
  isBlacklisted: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const createTestingModule = async (enableTokenBlacklisting: boolean) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            findEntityById: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'ENABLE_TOKEN_BLACKLISTING') return enableTokenBlacklisting;
              if (key === 'USE_REDIS') return false;
              return null;
            }),
          },
        },
        {
          provide: TOKEN_BLACKLIST,
          useFactory: (configService: ConfigService) => {
            if (!configService.get<boolean>('ENABLE_TOKEN_BLACKLISTING')) {
              return null;
            }
            return configService.get<boolean>('USE_REDIS')
              ? mockTokenBlacklistService
              : mockTokenBlacklistService;
          },
          inject: [ConfigService],
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);
  };

  beforeEach(async () => {
    await createTestingModule(true);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const user: User = new User();
      user.uuid = 'user-uuid';
      user.role = Role.PATIENT;
      user.validatePassword = jest.fn().mockResolvedValue(true);
      user.isActive = true;
      user.setLastLogin = jest.fn();

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);
      jest.spyOn(jwtService, 'sign').mockReturnValue('jwt-token');

      const result: LoginResponseDto = await authService.login(loginDto);

      expect(result).toEqual({ token: 'jwt-token' });
      expect(user.validatePassword).toHaveBeenCalledWith('password');
      expect(user.setLastLogin).toHaveBeenCalled();
      expect(usersService.save).toHaveBeenCalledWith(user);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'invalid' };

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      const loginDto: LoginDto = { email: 'deactivated@example.com', password: 'password' };
      const user: User = new User();
      user.validatePassword = jest.fn().mockResolvedValue(true);
      user.isActive = false;

      jest.spyOn(usersService, 'findByEmail').mockResolvedValue(user);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return a message on successful logout', async () => {
      const token = 'valid-token';
      const user: User = new User();
      user.uuid = 'user-uuid';
      user.setLastLogout = jest.fn();

      jest.spyOn(jwtService, 'verify').mockReturnValue({ uuid: user.uuid, exp: Math.floor(Date.now() / 1000) + 3600 });
      jest.spyOn(usersService, 'findEntityById').mockResolvedValue(user);

      const result: LogoutResponseDto = await authService.logout(token);

      expect(result).toEqual({ message: 'Successfully logged out' });
      expect(user.setLastLogout).toHaveBeenCalled();
      expect(usersService.save).toHaveBeenCalledWith(user);
      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(token, 3600);
    });

    it('should throw UnauthorizedException if token is invalid', async () => {
      const token = 'invalid-token';

      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new UnauthorizedException('Invalid token');
      });

      await expect(authService.logout(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found during logout', async () => {
      const token = 'valid-token';

      jest.spyOn(jwtService, 'verify').mockReturnValue({ uuid: 'invalid-uuid' });
      jest.spyOn(usersService, 'findEntityById').mockResolvedValue(null);

      await expect(authService.logout(token)).rejects.toThrow(UnauthorizedException);
    });

    it('should handle token blacklisting based on environment variables', async () => {
      const token = 'valid-token';
      const user: User = new User();
      user.uuid = 'user-uuid';
      user.setLastLogout = jest.fn();

      jest.spyOn(jwtService, 'verify').mockReturnValue({ uuid: user.uuid, exp: Math.floor(Date.now() / 1000) + 3600 });
      jest.spyOn(usersService, 'findEntityById').mockResolvedValue(user);

      // Enable token blacklisting
      await createTestingModule(true);
      await authService.logout(token);
      expect(mockTokenBlacklistService.blacklistToken).toHaveBeenCalledWith(token, 3600);

      jest.clearAllMocks();

      // Disable token blacklisting
      await createTestingModule(false);
      jest.spyOn(jwtService, 'verify').mockReturnValue({ uuid: user.uuid, exp: Math.floor(Date.now() / 1000) + 3600 });
      jest.spyOn(usersService, 'findEntityById').mockResolvedValue(user);
      await authService.logout(token);
      expect(mockTokenBlacklistService.blacklistToken).not.toHaveBeenCalled();
    });
  });
});
