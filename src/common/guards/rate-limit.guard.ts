// src/common/guards/rate-limit.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT_METADATA_KEY } from '../decorators/rate-limit.decorator';
import { TooManyRequestsException } from '../exceptions/too-many-requests.exception';
import { CustomLoggerService } from '../services/custom-logger.service';
import { ConfigService } from '@nestjs/config';
import { Role } from '../enums/roles.enum';

const rateLimitStore = new Map<string, { count: number; lastRequestTime: number }>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: CustomLoggerService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const rateLimit = this.reflector.get<number>(RATE_LIMIT_METADATA_KEY, context.getHandler());
    const userRole = request.user?.role;

    if (!rateLimit) {
      return true;
    }

    const isDevelopment = this.configService.get<string>('NODE_ENV') === 'development';
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    const windowTime = this.configService.get<number>('RATE_LIMIT_WINDOW_TIME'); // In miliseconds
    const superUserRateLimitMultiplier = this.configService.get<number>('RATE_LIMIT_SUPER_USER'); // Multiplies the route method rate limit decorator's limiting points

    const ip = request.ip;
    const currentTime = Date.now();

    const key = `${ip}:${context.getHandler().name}`;

    const rateData = rateLimitStore.get(key) || { count: 0, lastRequestTime: currentTime };


    if (isDevelopment && (userRole === Role.ADMIN || userRole === Role.MANAGER)) {
      // No rate limiting for admins and managers in development environment
      return true;
    }

    let adjustedRateLimit = rateLimit;
    let adjustedWindowTime = windowTime;

    if (isProduction && (userRole === Role.ADMIN || userRole === Role.MANAGER)) {
      adjustedRateLimit = rateLimit * superUserRateLimitMultiplier;
    }

    if (currentTime - rateData.lastRequestTime > adjustedWindowTime) {
      rateData.count = 1;
      rateData.lastRequestTime = currentTime;
    } else {
      rateData.count += 1;
    }

    rateLimitStore.set(key, rateData);

    if (rateData.count > adjustedRateLimit) {
      this.logger.logRateLimitExceeded(request, context.getClass().name, context.getHandler().name);
      throw new TooManyRequestsException();
    }

    return true;
  }
}
