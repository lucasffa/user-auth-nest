// src/common/guards/role-based-throttler.guard.ts
import { Injectable, ExecutionContext, Inject, Optional } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerStorageService, ThrottlerModuleOptions, ThrottlerOptions, ThrottlerGetTrackerFunction, ThrottlerGenerateKeyFunction } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { rateLimitConfig } from '../../configs/rate-limit.config';
import { Role } from '../enums/roles.enum';
import { Request } from 'express';

@Injectable()
export class RoleBasedThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Optional() @Inject('THROTTLER_OPTIONS') options: ThrottlerModuleOptions,
    @Inject(ThrottlerStorageService) storageService: ThrottlerStorageService,
    @Inject(Reflector) reflector: Reflector,
    private readonly configService: ConfigService,
  ) {
    super(options, storageService, reflector);
  }

  async handleRequest(
    context: ExecutionContext, 
    limit: number, 
    ttl: number, 
    throttler: ThrottlerOptions, 
    getTracker: ThrottlerGetTrackerFunction, 
    generateKey: ThrottlerGenerateKeyFunction
  ): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const user = req.user; // Assume user is already attached to request (e.g., through JWT auth)
    const role = user.role as Role;
    const handler = context.getHandler().name;
    const controller = context.getClass().name.toLowerCase().replace('controller', '');

    const routeConfig = rateLimitConfig[controller]?.[handler];
    if (routeConfig && routeConfig[role]) {
      limit = routeConfig[role].limit;
      ttl = routeConfig[role].ttl;
    }

    return super.handleRequest(context, limit, ttl, throttler, getTracker, generateKey);
  }
}
