// src/auth/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException, Inject, Optional } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LocalTokenBlacklistService } from './services/local-token-blacklist.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(
        @Inject(LocalTokenBlacklistService) private readonly tokenBlacklistService: LocalTokenBlacklistService,
        private readonly jwtService: JwtService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (this.tokenBlacklistService) {
            const blackListResult = await this.tokenBlacklistService.isBlacklisted(token);
            if (blackListResult) {
                throw new UnauthorizedException('Token is blacklisted');
            }
        }

        const result = (await super.canActivate(context)) as boolean;
        const user = this.jwtService.verify(token);
        request.user = user;

        return result;
    }

    private extractTokenFromHeader(request: any): string {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            throw new UnauthorizedException('Invalid token format');
        }

        return token;
    }
}
