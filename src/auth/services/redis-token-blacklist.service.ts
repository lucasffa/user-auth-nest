// src/auth/services/redis-token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { ITokenBlacklist } from '../interfaces/token-blacklist.interface';
import Redis from 'ioredis';

@Injectable()
export class RedisTokenBlacklistService implements ITokenBlacklist {
  private redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    });
  }

  async blacklistToken(token: string, expirationTime: number): Promise<void> {
    await this.redisClient.set(token, 'blacklisted', 'EX', expirationTime);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const result = await this.redisClient.get(token);
    return result === 'blacklisted';
  }
}
