// src/auth/services/local-token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { ITokenBlacklist } from '../interfaces/token-blacklist.interface';

@Injectable()
export class LocalTokenBlacklistService implements ITokenBlacklist {
  private blacklist: Map<string, number> = new Map();

  async blacklistToken(token: string, expirationTime: number): Promise<void> {
    const expiry = Date.now() + expirationTime * 1000;
    this.blacklist.set(token, expiry);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const expiry = this.blacklist.get(token);
    if (expiry && Date.now() < expiry) {
      return true;
    }
    this.blacklist.delete(token);
    return false;
  }
}
