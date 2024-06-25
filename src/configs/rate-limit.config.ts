// src/config/rate-limit.config.ts

import { Role } from '../common/enums/roles.enum';

export const rateLimitConfig = {
  users: {
    create: {
      [Role.ADMIN]: { limit: 10, ttl: 30 },
      [Role.MANAGER]: { limit: 10, ttl: 60 },
      [Role.OPERATOR]: { limit: 3, ttl: 180 },
      [Role.PATIENT]: { limit: 2, ttl: 300 },
    },
    findOne: {
      [Role.ADMIN]: { limit: 10, ttl: 30 },
      [Role.MANAGER]: { limit: 10, ttl: 60 },
      [Role.OPERATOR]: { limit: 3, ttl: 180 },
      [Role.PATIENT]: { limit: 2, ttl: 300 },
    },
    update: {
      [Role.ADMIN]: { limit: 5, ttl: 60 },
      [Role.MANAGER]: { limit: 5, ttl: 120 },
      [Role.OPERATOR]: { limit: 2, ttl: 240 },
      [Role.PATIENT]: { limit: 1, ttl: 300 },
    },
    delete: {
      [Role.ADMIN]: { limit: 5, ttl: 60 },
      [Role.MANAGER]: { limit: 5, ttl: 120 },
      [Role.OPERATOR]: { limit: 2, ttl: 240 },
      [Role.PATIENT]: { limit: 1, ttl: 300 },
    },
    deactivate: {
      [Role.ADMIN]: { limit: 5, ttl: 60 },
      [Role.MANAGER]: { limit: 5, ttl: 120 },
      [Role.OPERATOR]: { limit: 2, ttl: 240 },
      [Role.PATIENT]: { limit: 1, ttl: 300 },
    },
    activate: {
      [Role.ADMIN]: { limit: 5, ttl: 60 },
      [Role.MANAGER]: { limit: 5, ttl: 120 },
      [Role.OPERATOR]: { limit: 2, ttl: 240 },
      [Role.PATIENT]: { limit: 1, ttl: 300 },
    },
  },
  // Add other routes and their rate limits here
};
