// src/auth/services/redis-token-blacklist.service.ts
import { Injectable, Optional, Inject } from '@nestjs/common';
import { ITokenBlacklist } from '../interfaces/token-blacklist.interface';
import { Redis } from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class RedisTokenBlacklistService implements ITokenBlacklist {
  private redis: Redis | null;

  constructor(
    @Optional() @InjectRedis() redisClient: Redis,
  ) {
    this.redis = process.env.USE_REDIS === 'true' ? redisClient : null;
  }

  async blacklistToken(token: string, expirationTime: number): Promise<void> {
    if (!this.redis) return;
    await this.redis.set(token, 'blacklisted', 'EX', expirationTime);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    if (!this.redis) return false;
    const result = await this.redis.get(token);
    return result === 'blacklisted';
  }
}
