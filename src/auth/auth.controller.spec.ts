// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto, LogoutDto, LogoutResponseDto } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return a token on successful login', async () => {
      const loginDto: LoginDto = { email: 'test@example.com', password: 'password' };
      const loginResponse: LoginResponseDto = { token: 'jwt-token' };

      jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);

      expect(await authController.login(loginDto)).toBe(loginResponse);
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const loginDto: LoginDto = { email: 'invalid@example.com', password: 'invalid' };

      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('Invalid credentials'));

      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user is deactivated', async () => {
      const loginDto: LoginDto = { email: 'deactivated@example.com', password: 'password' };

      jest.spyOn(authService, 'login').mockRejectedValue(new UnauthorizedException('User is deactivated'));

      await expect(authController.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('should return a message on successful logout', async () => {
      const logoutDto: LogoutDto = { uuid: 'user-uuid' };
      const logoutResponse: LogoutResponseDto = { message: 'Successfully logged out' };

      jest.spyOn(authService, 'logout').mockResolvedValue(logoutResponse);

      expect(await authController.logout(logoutDto)).toBe(logoutResponse);
    });

    it('should throw UnauthorizedException if user not found during logout', async () => {
      const logoutDto: LogoutDto = { uuid: 'invalid-uuid' };

      jest.spyOn(authService, 'logout').mockRejectedValue(new UnauthorizedException('User not found'));

      await expect(authController.logout(logoutDto)).rejects.toThrow(UnauthorizedException);
    });
  });
});
