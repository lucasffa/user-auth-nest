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
        console.log("JwtAuthGuard constructor, this.tokenBlacklistService: ", this.tokenBlacklistService);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        console.log("In JwtAuthGuard.canActivate, token: ", token);
        console.log("In JwtAuthGuard.canActivate, this.tokenBlacklistService: ", this.tokenBlacklistService);

        if (this.tokenBlacklistService) {
            const blackListResult = await this.tokenBlacklistService.isBlacklisted(token);
            console.log("In JwtAuthGuard.canActivate, this.tokenBlacklistService.isBlacklisted(token): ", blackListResult);
            if (blackListResult) {
                throw new UnauthorizedException('Token is blacklisted');
            }
        }

        return super.canActivate(context) as boolean;
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
