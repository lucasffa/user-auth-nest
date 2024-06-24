// src/auth/services/local-token-blacklist.service.ts
import { Injectable } from '@nestjs/common';
import { ITokenBlacklist } from '../interfaces/token-blacklist.interface';

@Injectable()
export class LocalTokenBlacklistService implements ITokenBlacklist {
    private blacklist = new Map<string, number>();

    async blacklistToken(token: string, expirationTime: number): Promise<void> {
        const expiry = Date.now() + expirationTime * 1000;
        const result = await this.blacklist.set(token, expiry);
        console.log('In LocalTokenBlacklistService.blacklistToken, result from this.blacklist.set(token, expiry): ', result);
    }


    async isBlacklisted(token: string): Promise<boolean> {
        const expiry = this.blacklist.get(token);
        if (!expiry) {
            return false;
        }
        if (Date.now() > expiry) {
            this.blacklist.delete(token);
            return false;
        }
        return true;
    }
}
