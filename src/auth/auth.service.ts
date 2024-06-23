import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginResponseDto, LogoutDto, LogoutResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

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
    return { token: this.jwtService.sign(payload) };
  }

  async logout(token: string): Promise<LogoutResponseDto> {
    try {
      const decodedToken = this.jwtService.verify(token);
      const uuid = decodedToken.uuid;

      const user = await this.usersService.findEntityById(uuid);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      user.setLastLogout();
      await this.usersService.save(user);
      return { message: 'Successfully logged out' };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
