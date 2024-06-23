// src/auth/auth.service.ts
import { Injectable, Inject, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TOKEN_BLACKLIST } from './constants';
import { ITokenBlacklist } from './interfaces/token-blacklist.interface';
import { LoginDto, LoginResponseDto, LogoutResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @Optional()
    @Inject(TOKEN_BLACKLIST)
    private readonly tokenBlacklistService: ITokenBlacklist | null,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user || !await user.validatePassword(loginDto.password)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is deactivated');
    }

    user.setLastLogin();
    await this.usersService.save(user);

    const payload = { uuid: user.uuid, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token };
  }

  async logout(token: string): Promise<LogoutResponseDto> {
    try {
      console.log('ENABLE_TOKEN_BLACKLISTING:', process.env.ENABLE_TOKEN_BLACKLISTING);
      console.log('tokenBlacklistService:', this.tokenBlacklistService);
      
      const decodedToken = this.jwtService.verify(token);
      const uuid = decodedToken.uuid;

      const user = await this.usersService.findEntityById(uuid);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      user.setLastLogout();
      await this.usersService.save(user);

      if (this.tokenBlacklistService) {
        const expirationTime = decodedToken.exp - Math.floor(Date.now() / 1000);
        await this.tokenBlacklistService.blacklistToken(token, expirationTime);
      }

      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
