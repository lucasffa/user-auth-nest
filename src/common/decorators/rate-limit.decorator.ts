// src/common/decorators/rate-limit.decorator.ts

import { SetMetadata } from '@nestjs/common';
import { rateLimitConfig } from '../../configs/rate-limit.config';
import { Role } from '../../common/enums/roles.enum';

export const RateLimit = (controller: keyof typeof rateLimitConfig, action: string) => {
  return (target: any, key: string, descriptor: PropertyDescriptor) => {
    const rateLimit = rateLimitConfig[controller][action] || {};
    SetMetadata('rateLimit', rateLimit)(target, key, descriptor);
  };
};
